import { db } from "@/index";
import { mentionsClassify } from "@/lib/schema";
import { and, sql, desc, or } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * RTM Mentions Search API
 * 
 * Searches mentions within the last 30 days based on search query
 * Supports fuzzy search across title, mention, and author fields
 */
export async function GET(request: Request) {
	const startTime = Date.now();
	try {
		const { searchParams } = new URL(request.url);

		// Extract filter parameters
		const searchQuery = searchParams.get("q") || "";
		const platform = searchParams.get("platform") || "";
		const channel = searchParams.get("channel") || "";
		const unit = searchParams.get("unit") || "";

		// Calculate date 30 days ago from today
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

		console.log("🔍 RTM Mentions Search API called:", {
			searchQuery,
			platform,
			channel,
			unit,
			thirtyDaysAgo: thirtyDaysAgoStr
		});

		// If no search query, return empty results
		if (!searchQuery || searchQuery.trim().length === 0) {
			return NextResponse.json({
				results: [],
				meta: {
					queryDate: new Date().toISOString(),
					searchQuery: "",
					totalResults: 0,
					totalTime: `${Date.now() - startTime}ms`,
				},
			});
		}

		// Build filter conditions manually (don't use buildWhereConditions as it uses inserttime)
		const whereConditions: any[] = [];

		// Date filtering - mentions table uses insertdate, not inserttime
		whereConditions.push(
			sql`${mentionsClassify.insertdate} >= ${thirtyDaysAgoStr}`
		);

		// Platform filtering
		if (platform && platform !== 'all') {
			whereConditions.push(
				sql`LOWER(${mentionsClassify.type}) LIKE ${`%${platform.toLowerCase()}%`}`
			);
		}

		// Channel filtering
		if (channel && channel !== '' && channel !== 'all') {
			whereConditions.push(
				sql`${mentionsClassify.channel} ILIKE ${`%${channel}%`}`
			);
		}

		// Unit filtering
		if (unit && unit !== 'all') {
			const unitLower = unit.toLowerCase();
			if (unitLower === 'berita' || unitLower === 'news') {
				whereConditions.push(
					sql`(LOWER(${mentionsClassify.groupname}) LIKE '%berita%' OR LOWER(${mentionsClassify.groupname}) LIKE '%news%')`
				);
			} else if (unitLower === 'radio') {
				whereConditions.push(
					sql`LOWER(${mentionsClassify.groupname}) LIKE '%radio%'`
				);
			} else if (unitLower === 'tv') {
				whereConditions.push(
					sql`LOWER(${mentionsClassify.groupname}) LIKE '%tv%'`
				);
			} else if (unitLower === 'official') {
				whereConditions.push(
					sql`LOWER(${mentionsClassify.groupname}) LIKE '%official%'`
				);
			} else {
				whereConditions.push(
					sql`LOWER(${mentionsClassify.groupname}) LIKE ${`%${unitLower}%`}`
				);
			}
		}

		// Add search conditions (fuzzy search across multiple fields)
		const searchConditions = [
			sql`LOWER(${mentionsClassify.title}) LIKE ${`%${searchQuery.toLowerCase()}%`}`,
			sql`LOWER(${mentionsClassify.mention}) LIKE ${`%${searchQuery.toLowerCase()}%`}`,
			sql`LOWER(${mentionsClassify.author}) LIKE ${`%${searchQuery.toLowerCase()}%`}`,
		];

		// Combine all conditions
		const allConditions = [
			...whereConditions,
			or(...searchConditions),
		];

		// Execute search query
		const searchResults = await db
			.select({
				id: mentionsClassify.id,
				channel: mentionsClassify.channel,
				title: mentionsClassify.title,
				mention: mentionsClassify.mention,
				platform: mentionsClassify.type,
				topic: mentionsClassify.topic,
				sentiment: mentionsClassify.sentiment,
				reach: mentionsClassify.reach,
				interactions: sql<number>`
					COALESCE(
						CASE WHEN NULLIF(${mentionsClassify.interaction}, 0) = 'NaN'::double precision THEN NULL ELSE NULLIF(${mentionsClassify.interaction}, 0) END,
						CASE WHEN NULLIF(${mentionsClassify.totalreactionscount}, 0) = 'NaN'::double precision THEN NULL ELSE NULLIF(${mentionsClassify.totalreactionscount}, 0) END,
						(
							COALESCE(CASE WHEN ${mentionsClassify.likecount} = 'NaN'::double precision THEN 0 ELSE ${mentionsClassify.likecount} END, 0) + 
							COALESCE(CASE WHEN ${mentionsClassify.commentcount} = 'NaN'::double precision THEN 0 ELSE ${mentionsClassify.commentcount} END, 0) + 
							COALESCE(CASE WHEN ${mentionsClassify.sharecount} = 'NaN'::double precision THEN 0 ELSE ${mentionsClassify.sharecount} END, 0) + 
							COALESCE(CASE WHEN ${mentionsClassify.playcount} = 'NaN'::double precision THEN 0 ELSE ${mentionsClassify.playcount} END, 0) + 
							COALESCE(CASE WHEN ${mentionsClassify.replycount} = 'NaN'::double precision THEN 0 ELSE ${mentionsClassify.replycount} END, 0) + 
							COALESCE(CASE WHEN ${mentionsClassify.retweetcount} = 'NaN'::double precision THEN 0 ELSE ${mentionsClassify.retweetcount} END, 0)
						),
						0
					)
				`,
				likecount: mentionsClassify.likecount,
				commentcount: mentionsClassify.commentcount,
				sharecount: mentionsClassify.sharecount,
				url: mentionsClassify.url,
				insertdate: mentionsClassify.insertdate,
				author: mentionsClassify.author,
				unit: mentionsClassify.groupname,
			})
			.from(mentionsClassify)
			.where(and(...allConditions))
			.orderBy(desc(mentionsClassify.reach))
			.limit(50); // Return top 50 results

		console.log(`⏱️ Search query completed in ${Date.now() - startTime}ms, found ${searchResults.length} results`);

		// Transform results
		const results = searchResults.map((row) => ({
			id: row.id,
			channel: row.channel,
			title: row.title,
			mention: row.mention,
			content: row.mention, // Map mention to content for compatibility
			platform: row.platform,
			category: row.topic, // Map topic to category for compatibility
			topic: row.topic,
			sentiment: row.sentiment,
			reach: Number(row.reach) || 0,
			interactions: Number(row.interactions) || 0,
			likecount: Number(row.likecount) || 0,
			commentcount: Number(row.commentcount) || 0,
			sharecount: Number(row.sharecount) || 0,
			url: row.url,
			postUrl: row.url,
			date: row.insertdate,
			insertdate: row.insertdate,
			author: row.author,
			unit: row.unit,
		}));

		const response = {
			results,
			meta: {
				queryDate: new Date().toISOString(),
				searchQuery,
				totalResults: results.length,
				totalTime: `${Date.now() - startTime}ms`,
				dateRange: {
					from: thirtyDaysAgoStr,
					to: new Date().toISOString().split('T')[0],
				},
			},
		};

		console.log("✅ RTM Mentions Search API response:", {
			totalResults: results.length,
			totalTime: response.meta.totalTime,
		});

		return NextResponse.json(response);
	} catch (error) {
		console.error("❌ RTM Mentions Search API error:", error);
		return NextResponse.json(
			{ error: "Failed to search mentions", details: error.message },
			{ status: 500 }
		);
	}
}

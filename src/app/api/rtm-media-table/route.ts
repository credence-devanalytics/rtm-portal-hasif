import { db } from "@/index";
import { mentionsClassify } from "@/lib/schema";
import { and, sql, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const startTime = Date.now();
	try {
		const { searchParams } = new URL(request.url);
		
		// Extract filter parameters
		const fromDate = searchParams.get("from") || "";
		const toDate = searchParams.get("to") || "";
		const platform = searchParams.get("platform") || "";
		const author = searchParams.get("author") || "";
		const unit = searchParams.get("unit") || "";

		console.log("📊 RTM Media Table API called with filters:", { fromDate, toDate, platform, author, unit });

		// Build where conditions manually for better control
		const whereConditions = [];
		
		// Date filtering using insertdate (NOW() - INTERVAL '30 days')
		if (fromDate && toDate) {
			whereConditions.push(sql`${mentionsClassify.insertdate} >= ${fromDate}::date`);
			whereConditions.push(sql`${mentionsClassify.insertdate} <= ${toDate}::date`);
		} else {
			// Default to last 30 days using PostgreSQL interval
			whereConditions.push(sql`${mentionsClassify.insertdate} >= NOW() - INTERVAL '30 days'`);
		}

		// Platform filtering (optional)
		if (platform && platform !== "" && platform !== "all") {
			whereConditions.push(
				sql`LOWER(${mentionsClassify.type}) LIKE ${`%${platform.toLowerCase()}%`}`
			);
		}

		// Author filtering (optional)
		if (author && author !== "" && author !== "all") {
			whereConditions.push(
				sql`LOWER(${mentionsClassify.author}) LIKE ${`%${author.toLowerCase()}%`}`
			);
		}

		console.log(`⏱️ Building conditions took ${Date.now() - startTime}ms`);

		let result;

		if (unit && unit !== "" && unit !== "all") {
			// Detailed view: Show channels within a specific unit
			// Add unit filter
			whereConditions.push(
				sql`LOWER(${mentionsClassify.groupname}) LIKE ${`%${unit.toLowerCase()}%`}`
			);

			const queryStartTime = Date.now();
			result = await db
				.select({
					groupname: mentionsClassify.groupname,
					name: mentionsClassify.channel,
					total_mentions: count(),
					total_reach: sql<number>`SUM(COALESCE(${mentionsClassify.reach}, 0))`,
					total_engagement: sql<number>`SUM(
						COALESCE(
							CASE 
								WHEN ${mentionsClassify.interaction} IS NOT NULL AND ${mentionsClassify.interaction} > 0 
								THEN ${mentionsClassify.interaction}
								ELSE COALESCE(${mentionsClassify.likecount}, 0) + COALESCE(${mentionsClassify.commentcount}, 0) + COALESCE(${mentionsClassify.sharecount}, 0)
							END, 
							0
						)
					)`,
				})
				.from(mentionsClassify)
				.where(and(...whereConditions))
				.groupBy(mentionsClassify.groupname, mentionsClassify.channel);
			console.log(`⏱️ Database query took ${Date.now() - queryStartTime}ms`);

			console.log(`✅ RTM Media Table (${unit}) response:`, result.length, "channels");

			// Sort results by total_mentions descending in JavaScript
			const sortStartTime = Date.now();
			const sortedChannels = result.sort((a, b) => Number(b.total_mentions) - Number(a.total_mentions));
			console.log(`⏱️ Sorting took ${Date.now() - sortStartTime}ms`);

			console.log(`⏱️ Total API time: ${Date.now() - startTime}ms`);

			return NextResponse.json({
				data: sortedChannels.map((row) => ({
					groupname: row.groupname,
					name: row.name,
					totalPosts: Number(row.total_mentions) || 0,
					totalReach: Number(row.total_reach) || 0,
					totalEngagement: Number(row.total_engagement) || 0,
				})),
				type: "channels",
				unit,
				meta: {
					queryDate: new Date().toISOString(),
					filters: { fromDate, toDate, platform, author, unit },
				},
			});
		} else {
			// Main view: Show all units (groupname)
			const queryStartTime = Date.now();
			result = await db
				.select({
					name: mentionsClassify.groupname,
					total_mentions: count(),
					total_reach: sql<number>`SUM(COALESCE(${mentionsClassify.reach}, 0))`,
					total_engagement: sql<number>`SUM(
						COALESCE(
							CASE 
								WHEN ${mentionsClassify.interaction} IS NOT NULL AND ${mentionsClassify.interaction} > 0 
								THEN ${mentionsClassify.interaction}
								ELSE COALESCE(${mentionsClassify.likecount}, 0) + COALESCE(${mentionsClassify.commentcount}, 0) + COALESCE(${mentionsClassify.sharecount}, 0)
							END, 
							0
						)
					)`,
				})
				.from(mentionsClassify)
				.where(and(...whereConditions))
				.groupBy(mentionsClassify.groupname);
			console.log(`⏱️ Database query took ${Date.now() - queryStartTime}ms`);

			console.log("✅ RTM Media Table (units) response:", result.length, "units");
			console.log("📊 Raw units data:", result.map(r => ({ 
				unit: r.name, 
				mentions: r.total_mentions,
				reach: r.total_reach
			})));

			// Sort results by total_mentions descending in JavaScript
			const sortStartTime = Date.now();
			const sortedUnits = result.sort((a, b) => Number(b.total_mentions) - Number(a.total_mentions));
			console.log(`⏱️ Sorting took ${Date.now() - sortStartTime}ms`);

			// Calculate grand totals
			const grandTotalMentions = result.reduce((sum, r) => sum + Number(r.total_mentions), 0);
			const grandTotalReach = result.reduce((sum, r) => sum + Number(r.total_reach), 0);
			console.log("🔢 Media Table Grand Totals:", { 
				totalMentions: grandTotalMentions,
				totalReach: grandTotalReach
			});

			console.log(`⏱️ Total API time: ${Date.now() - startTime}ms`);

			return NextResponse.json({
				data: sortedUnits.map((row) => ({
					name: row.name,
					totalPosts: Number(row.total_mentions) || 0,
					totalReach: Number(row.total_reach) || 0,
					totalEngagement: Number(row.total_engagement) || 0,
				})),
				type: "units",
				unit: null,
				meta: {
					queryDate: new Date().toISOString(),
					filters: { fromDate, toDate, platform, author },
				},
			});
		}
	} catch (error) {
		console.error("❌ RTM Media Table API error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch RTM media table data", details: error.message },
			{ status: 500 }
		);
	}
}

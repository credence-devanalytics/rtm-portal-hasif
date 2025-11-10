/**
 * Popular Posts API
 * Provides most popular social media posts with engagement metrics
 */

import { NextResponse } from "next/server";
import { db } from "@/index";
import { mentionsClassifyPublic } from "@/lib/schema";
import { desc, gte, lte, and, sql, inArray, or } from "drizzle-orm";

// Helper function to build WHERE conditions
const buildWhereConditions = (filters) => {
	const conditions = [];

	// Date range filters
	if (filters.dateRange?.from) {
		conditions.push(
			gte(
				mentionsClassifyPublic.inserttime,
				`${filters.dateRange.from}T00:00:00.000Z`
			)
		);
	}

	if (filters.dateRange?.to) {
		conditions.push(
			lte(
				mentionsClassifyPublic.inserttime,
				`${filters.dateRange.to}T23:59:59.999Z`
			)
		);
	}

	// Sentiment filters
	if (filters.sentiments && filters.sentiments.length > 0) {
		conditions.push(
			inArray(mentionsClassifyPublic.autosentiment, filters.sentiments)
		);
	}

	// Source/Platform filters (case-insensitive)
	if (filters.sources && filters.sources.length > 0) {
		const sourceConditions = filters.sources.map((source) =>
			sql`LOWER(${mentionsClassifyPublic.type}) LIKE LOWER(${'%' + source + '%'})`
		);
		if (sourceConditions.length === 1) {
			conditions.push(sourceConditions[0]);
		} else {
			conditions.push(or(...sourceConditions));
		}
	}

	// Author filters
	if (filters.authors && filters.authors.length > 0) {
		conditions.push(inArray(mentionsClassifyPublic.author, filters.authors));
	}

	return conditions;
};

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);

		// Extract filter parameters
		const sentimentsParam = searchParams.get("sentiments");
		const sourcesParam = searchParams.get("sources");
		const authorsParam = searchParams.get("authors");
		const dateFromParam = searchParams.get("date_from");
		const dateToParam = searchParams.get("date_to");
		const limit = parseInt(searchParams.get("limit")) || 20;
		const sortBy = searchParams.get("sort") || "reach"; // 'reach', 'interactions', 'date'

		// Process filters
		const filters = {
			sentiments: sentimentsParam ? sentimentsParam.split(",") : [],
			sources: sourcesParam ? sourcesParam.split(",") : [],
			authors: authorsParam ? authorsParam.split(",") : [],
			dateRange: {
				from: dateFromParam,
				to: dateToParam,
			},
		};

		console.log(
			"⭐ Popular Posts API - Processing filters:",
			filters,
			"Sort by:",
			sortBy
		);

		// Build WHERE conditions
		const whereConditions = buildWhereConditions(filters);

		// Base conditions to only include records with meaningful engagement data
		const baseConditions = [
			sql`${mentionsClassifyPublic.autosentiment} IS NOT NULL`,
			// Only include posts that have some engagement metrics
			// Check both standard columns AND Twitter-specific columns
			sql`(
				COALESCE(${mentionsClassifyPublic.reach}, 0) > 0 OR
				(${mentionsClassifyPublic.likecount} != 'NaN'::double precision AND COALESCE(${mentionsClassifyPublic.likecount}, 0) > 0) OR
				(${mentionsClassifyPublic.sharecount} != 'NaN'::double precision AND COALESCE(${mentionsClassifyPublic.sharecount}, 0) > 0) OR
				(${mentionsClassifyPublic.commentcount} != 'NaN'::double precision AND COALESCE(${mentionsClassifyPublic.commentcount}, 0) > 0) OR
				(${mentionsClassifyPublic.favoritecount} != 'NaN'::double precision AND COALESCE(${mentionsClassifyPublic.favoritecount}, 0) > 0) OR
				(${mentionsClassifyPublic.retweetcount} != 'NaN'::double precision AND COALESCE(${mentionsClassifyPublic.retweetcount}, 0) > 0) OR
				(${mentionsClassifyPublic.replycount} != 'NaN'::double precision AND COALESCE(${mentionsClassifyPublic.replycount}, 0) > 0) OR
				(${mentionsClassifyPublic.quotecount} != 'NaN'::double precision AND COALESCE(${mentionsClassifyPublic.quotecount}, 0) > 0)
			)`,
		];

		const allConditions = [...baseConditions, ...whereConditions];

		try {
			// Determine sort order based on the sortBy parameter
			let orderByClause;
			switch (sortBy) {
				case "interactions":
					// Sort by total interactions - use Twitter-specific columns for Twitter posts
					// For Twitter: favoritecount + retweetcount + replycount + quotecount
					// For others: likecount + sharecount + commentcount
					orderByClause = desc(
						sql`(
							CASE 
								WHEN LOWER(${mentionsClassifyPublic.type}) LIKE '%twitter%' THEN
									CASE WHEN ${mentionsClassifyPublic.favoritecount} = 'NaN'::double precision THEN 0 ELSE COALESCE(${mentionsClassifyPublic.favoritecount}, 0)::integer END + 
									CASE WHEN ${mentionsClassifyPublic.retweetcount} = 'NaN'::double precision THEN 0 ELSE COALESCE(${mentionsClassifyPublic.retweetcount}, 0)::integer END + 
									CASE WHEN ${mentionsClassifyPublic.replycount} = 'NaN'::double precision THEN 0 ELSE COALESCE(${mentionsClassifyPublic.replycount}, 0)::integer END + 
									CASE WHEN ${mentionsClassifyPublic.quotecount} = 'NaN'::double precision THEN 0 ELSE COALESCE(${mentionsClassifyPublic.quotecount}, 0)::integer END
								ELSE
									CASE WHEN ${mentionsClassifyPublic.likecount} = 'NaN'::double precision THEN 0 ELSE COALESCE(${mentionsClassifyPublic.likecount}, 0)::integer END + 
									CASE WHEN ${mentionsClassifyPublic.sharecount} = 'NaN'::double precision THEN 0 ELSE COALESCE(${mentionsClassifyPublic.sharecount}, 0)::integer END + 
									CASE WHEN ${mentionsClassifyPublic.commentcount} = 'NaN'::double precision THEN 0 ELSE COALESCE(${mentionsClassifyPublic.commentcount}, 0)::integer END
							END
						)`
					);
					console.log("📊 Sorting by interactions (Twitter-aware)");
					break;
				case "date":
					// Sort by insertion time (most recent first)
					orderByClause = desc(mentionsClassifyPublic.inserttime);
					console.log("📊 Sorting by date");
					break;
				case "reach":
				default:
					// Sort by reach (default)
					orderByClause = desc(mentionsClassifyPublic.reach);
					console.log("📊 Sorting by reach");
					break;
			}

			console.log("🔍 Executing database query with sort:", sortBy);

			// Get popular posts with dynamic sorting - use DISTINCT to avoid duplicates
			const popularPostsQuery = db
				.select({
					id: mentionsClassifyPublic.id,
					content: mentionsClassifyPublic.mention,
					title: mentionsClassifyPublic.title,
					author: mentionsClassifyPublic.author,
					type: mentionsClassifyPublic.type,
					url: mentionsClassifyPublic.url,
					inserttime: mentionsClassifyPublic.inserttime,
					sentiment: mentionsClassifyPublic.autosentiment,
					reach: mentionsClassifyPublic.reach,
					likecount: mentionsClassifyPublic.likecount,
					sharecount: mentionsClassifyPublic.sharecount,
					commentcount: mentionsClassifyPublic.commentcount,
					engagementrate: mentionsClassifyPublic.engagementrate,
					confidence: mentionsClassifyPublic.confidence,
					// Twitter-specific columns
					favoritecount: mentionsClassifyPublic.favoritecount,
					retweetcount: mentionsClassifyPublic.retweetcount,
					replycount: mentionsClassifyPublic.replycount,
					quotecount: mentionsClassifyPublic.quotecount,
				})
				.from(mentionsClassifyPublic)
				.where(and(...allConditions))
				.orderBy(orderByClause)
				.limit(limit);

			const popularPosts = await popularPostsQuery;

			// Remove duplicates by ID (in case database has duplicate records)
			const uniquePosts = [];
			const seenIds = new Set();
			for (const post of popularPosts) {
				if (!seenIds.has(post.id)) {
					seenIds.add(post.id);
					uniquePosts.push(post);
				}
			}

			console.log(`📊 Total posts: ${popularPosts.length}, Unique posts: ${uniquePosts.length}, Duplicates removed: ${popularPosts.length - uniquePosts.length}`);

			// Debug: log raw database results
			console.log("📊 Raw database results count:", uniquePosts.length);
			if (uniquePosts.length > 0) {
				console.log("📊 Raw first post:", {
					id: uniquePosts[0].id,
					author: uniquePosts[0].author,
					type: uniquePosts[0].type,
					reach: uniquePosts[0].reach,
					likecount: uniquePosts[0].likecount,
					sharecount: uniquePosts[0].sharecount,
					commentcount: uniquePosts[0].commentcount,
					favoritecount: uniquePosts[0].favoritecount,
					retweetcount: uniquePosts[0].retweetcount,
					replycount: uniquePosts[0].replycount,
					quotecount: uniquePosts[0].quotecount,
				});
				console.log("📊 Raw second post:", uniquePosts[1] ? {
					id: uniquePosts[1].id,
					author: uniquePosts[1].author,
					type: uniquePosts[1].type,
					reach: uniquePosts[1].reach,
					likecount: uniquePosts[1].likecount,
					sharecount: uniquePosts[1].sharecount,
					commentcount: uniquePosts[1].commentcount,
					favoritecount: uniquePosts[1].favoritecount,
					retweetcount: uniquePosts[1].retweetcount,
					replycount: uniquePosts[1].replycount,
					quotecount: uniquePosts[1].quotecount,
				} : "No second post");
			}

			// Process posts data to add calculated fields
			const processedPosts = uniquePosts.map((post) => {
				// Helper to safely parse numbers and filter out NaN
				const safeParseInt = (value) => {
					const parsed = parseInt(value);
					return isNaN(parsed) || value === 'NaN' ? 0 : parsed;
				};
				const safeParseFloat = (value) => {
					const parsed = parseFloat(value);
					return isNaN(parsed) || value === 'NaN' ? 0 : parsed;
				};

				// Check if this is a Twitter post
				const isTwitter = post.type?.toLowerCase() === 'twitter';

				// Use Twitter-specific columns if it's a Twitter post
				const likes = isTwitter ? safeParseInt(post.favoritecount) : safeParseInt(post.likecount);
				const shares = isTwitter ? safeParseInt(post.retweetcount) : safeParseInt(post.sharecount);
				const comments = isTwitter ? safeParseInt(post.replycount) : safeParseInt(post.commentcount);
				const quotes = isTwitter ? safeParseInt(post.quotecount) : 0;

				const totalInteractions = likes + shares + comments + quotes;

				// Debug first few posts
				if (uniquePosts.indexOf(post) < 3) {
					console.log(`📊 Processing post ${uniquePosts.indexOf(post) + 1}:`, {
						id: post.id,
						type: post.type,
						isTwitter,
						likes,
						shares,
						comments,
						quotes,
						totalInteractions,
					});
				}

				return {
					...post,
					reach: safeParseInt(post.reach),
					likecount: likes,
					sharecount: shares,
					commentcount: comments,
					quotecount: quotes,
					engagementrate: safeParseFloat(post.engagementrate),
					confidence: safeParseFloat(post.confidence),
					totalInteractions: totalInteractions,
					isTwitter: isTwitter,
				};
			});

			console.log(
				"📊 Popular posts processed:",
				processedPosts.length,
				"posts"
			);

			// Debug: log first post to verify data structure
			if (processedPosts.length > 0) {
				console.log("📊 Sample post data:", {
					id: processedPosts[0].id,
					reach: processedPosts[0].reach,
					likecount: processedPosts[0].likecount,
					sharecount: processedPosts[0].sharecount,
					commentcount: processedPosts[0].commentcount,
					totalInteractions: processedPosts[0].totalInteractions,
				});
			} else {
				console.log("⚠️  No posts found matching the current filters");
			}

			const response = {
				success: true,
				data: processedPosts,
				meta: {
					filters,
					queryTime: new Date().toISOString(),
					dataSource: "database",
					totalPosts: processedPosts.length,
					sortBy,
					limit,
				},
			};

			console.log("📊 API Response structure:", {
				success: response.success,
				dataLength: response.data?.length,
				hasData: !!response.data,
			});

			return NextResponse.json(response);
		} catch (dbError) {
			console.error("❌ Database error:", dbError.message);

			// Return error instead of fallback data
			return NextResponse.json(
				{
					success: false,
					error: "Database query failed",
					details: dbError.message,
					timestamp: new Date().toISOString(),
				},
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error("🚨 Popular Posts API error:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch popular posts data",
				details: error.message,
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}

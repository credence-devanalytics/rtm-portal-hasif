/**
 * Popular Posts API
 * Provides most popular social media posts with engagement metrics
 */

import { NextResponse } from "next/server";
import { db } from "@/index";
import { mentionsClassifyPublic } from "@/lib/schema";
import { desc, gte, lte, and, sql, inArray, like, or } from "drizzle-orm";

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

	// Source/Platform filters
	if (filters.sources && filters.sources.length > 0) {
		const sourceConditions = filters.sources.map((source) =>
			like(mentionsClassifyPublic.type, `%${source}%`)
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
			sql`(COALESCE(${mentionsClassifyPublic.reach}, 0) > 0 OR
           COALESCE(${mentionsClassifyPublic.likecount}, 0) > 0 OR
           COALESCE(${mentionsClassifyPublic.sharecount}, 0) > 0 OR
           COALESCE(${mentionsClassifyPublic.commentcount}, 0) > 0)`,
		];

		const allConditions = [...baseConditions, ...whereConditions];

		try {
			// Determine sort order based on the sortBy parameter
			let orderByClause;
			switch (sortBy) {
				case "interactions":
					// Sort by total interactions (likes + shares + comments)
					orderByClause = desc(
						sql`(COALESCE(${mentionsClassifyPublic.likecount}, 0) + COALESCE(${mentionsClassifyPublic.sharecount}, 0) + COALESCE(${mentionsClassifyPublic.commentcount}, 0))`
					);
					console.log("📊 Sorting by interactions");
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

			// Get popular posts with dynamic sorting
			const popularPosts = await db
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
				})
				.from(mentionsClassifyPublic)
				.where(and(...allConditions))
				.orderBy(orderByClause)
				.limit(limit);

			// Debug: log raw database results
			console.log("📊 Raw database results count:", popularPosts.length);
			if (popularPosts.length > 0) {
				console.log("📊 Raw first post:", {
					id: popularPosts[0].id,
					reach: popularPosts[0].reach,
					likecount: popularPosts[0].likecount,
					sharecount: popularPosts[0].sharecount,
					commentcount: popularPosts[0].commentcount,
					type: popularPosts[0].type,
				});
			}

			// Process posts data to add calculated fields
			const processedPosts = popularPosts.map((post) => ({
				...post,
				reach: parseInt(post.reach) || 0,
				likecount: parseInt(post.likecount) || 0,
				sharecount: parseInt(post.sharecount) || 0,
				commentcount: parseInt(post.commentcount) || 0,
				engagementrate: parseFloat(post.engagementrate) || 0,
				confidence: parseFloat(post.confidence) || 0,
				totalInteractions:
					(parseInt(post.likecount) || 0) +
					(parseInt(post.sharecount) || 0) +
					(parseInt(post.commentcount) || 0),
			}));

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

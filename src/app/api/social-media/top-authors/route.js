/**
 * Top Authors API
 * Provides statistics for top authors/accounts from mention_classify_public
 */

import { NextResponse } from "next/server";
import { db } from "@/index";
import { mentionsClassifyPublic } from "@/lib/schema";
import { desc, asc, gte, lte, and, sql, inArray, or } from "drizzle-orm";

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

	// Topic filters
	if (filters.topics && filters.topics.length > 0) {
		conditions.push(inArray(mentionsClassifyPublic.topic, filters.topics));
	}

	return conditions;
};

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);

		// Extract filter parameters
		const sentimentsParam = searchParams.get("sentiments");
		const sourcesParam = searchParams.get("sources");
		const topicsParam = searchParams.get("topics");
		const dateFromParam = searchParams.get("date_from");
		const dateToParam = searchParams.get("date_to");
		const limit = parseInt(searchParams.get("limit")) || 10;

		// Extract sorting parameters
		const sortBy = searchParams.get("sortBy") || "totalPosts"; // Default sort by total posts
		const sortOrder = searchParams.get("sortOrder") || "desc"; // Default descending

		// Process filters
		const filters = {
			sentiments: sentimentsParam ? sentimentsParam.split(",") : [],
			sources: sourcesParam ? sourcesParam.split(",") : [],
			topics: topicsParam ? topicsParam.split(",") : [],
			dateRange: {
				from: dateFromParam,
				to: dateToParam,
			},
		};

		console.log("👥 Top Authors API - Processing filters:", filters);
		console.log("📊 Sorting by:", sortBy, sortOrder);

		// Build WHERE conditions
		const whereConditions = buildWhereConditions(filters);

		// Base conditions
		const baseConditions = [
			sql`${mentionsClassifyPublic.author} IS NOT NULL`,
			sql`${mentionsClassifyPublic.author} != ''`,
		];

		const allConditions = [...baseConditions, ...whereConditions];

		try {
			// Determine the sort column expression
			const sortColumn =
				sortBy === "followers"
					? sql`MAX(COALESCE(${mentionsClassifyPublic.followerscount}, 0))`
					: sql`COUNT(*)`;

			// Determine the order direction
			const orderBy = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

			// First, get the basic author statistics
			const authorStats = await db
				.select({
					author: mentionsClassifyPublic.author,
					followersCount:
						sql`MAX(COALESCE(${mentionsClassifyPublic.followerscount}, 0))`.as(
							"followers_count"
						),
					totalPosts: sql`COUNT(*)`.as("total_posts"),
					positiveCount:
						sql`COUNT(CASE WHEN ${mentionsClassifyPublic.autosentiment} = 'positive' THEN 1 END)`.as(
							"positive_count"
						),
					negativeCount:
						sql`COUNT(CASE WHEN ${mentionsClassifyPublic.autosentiment} = 'negative' THEN 1 END)`.as(
							"negative_count"
						),
					neutralCount:
						sql`COUNT(CASE WHEN ${mentionsClassifyPublic.autosentiment} = 'neutral' THEN 1 END)`.as(
							"neutral_count"
						),
					topicCount: sql`COUNT(DISTINCT ${mentionsClassifyPublic.topic})`.as(
						"topic_count"
					),
				})
				.from(mentionsClassifyPublic)
				.where(and(...allConditions))
				.groupBy(mentionsClassifyPublic.author)
				.orderBy(orderBy)
				.limit(limit);

			console.log("📊 Top authors found:", authorStats.length);

			// For each author, get their most common topic
			const topAuthors = await Promise.all(
				authorStats.map(async (author) => {
					const topTopicResult = await db
						.select({
							topic: mentionsClassifyPublic.topic,
							count: sql`COUNT(*)`.as("count"),
						})
						.from(mentionsClassifyPublic)
						.where(
							and(
								...allConditions,
								sql`${mentionsClassifyPublic.author} = ${author.author}`
							)
						)
						.groupBy(mentionsClassifyPublic.topic)
						.orderBy(desc(sql`COUNT(*)`))
						.limit(1);

					return {
						...author,
						topTopic: topTopicResult[0]?.topic || "N/A",
					};
				})
			);

			console.log("📊 Top authors with topics:", topAuthors.length);

			// Process the results
			const processedAuthors = topAuthors.map((author) => ({
				author: author.author,
				followersCount: parseInt(author.followersCount) || 0,
				totalPosts: parseInt(author.totalPosts) || 0,
				positiveCount: parseInt(author.positiveCount) || 0,
				negativeCount: parseInt(author.negativeCount) || 0,
				neutralCount: parseInt(author.neutralCount) || 0,
				topTopic: author.topTopic || "N/A",
				topicCount: parseInt(author.topicCount) || 0,
			}));

			const response = {
				success: true,
				data: processedAuthors,
				meta: {
					filters,
					sortBy,
					sortOrder,
					queryTime: new Date().toISOString(),
					dataSource: "database",
					totalAuthors: processedAuthors.length,
					limit,
				},
			};

			console.log("📊 Top Authors API Response:", {
				success: response.success,
				dataLength: response.data?.length,
			});

			return NextResponse.json(response);
		} catch (dbError) {
			console.error("❌ Database error in top authors query:", dbError.message);

			// Generate fallback data
			const generateFallbackAuthor = (index) => {
				const topics = [
					"Politics",
					"Health",
					"Technology",
					"Entertainment",
					"Sports",
					"Education",
				];
				const totalPosts = Math.floor(Math.random() * 50) + 10;
				const posCount = Math.floor(Math.random() * totalPosts * 0.6);
				const negCount = Math.floor(
					Math.random() * (totalPosts - posCount) * 0.4
				);
				const neuCount = totalPosts - posCount - negCount;

				return {
					author: `User${index + 1}`,
					followersCount: Math.floor(Math.random() * 50000) + 5000,
					totalPosts,
					positiveCount: posCount,
					negativeCount: negCount,
					neutralCount: neuCount,
					topTopic: topics[index % topics.length],
					topicCount: Math.floor(Math.random() * 5) + 1,
				};
			};

			const fallbackAuthors = Array.from(
				{ length: Math.min(limit, 10) },
				(_, index) => generateFallbackAuthor(index)
			);

			return NextResponse.json({
				success: true,
				data: fallbackAuthors,
				meta: {
					filters,
					queryTime: new Date().toISOString(),
					dataSource: "fallback",
					warning: "Using fallback data due to database connectivity issues",
					totalAuthors: fallbackAuthors.length,
					limit,
				},
			});
		}
	} catch (error) {
		console.error("🚨 Top Authors API error:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch top authors data",
				details: error.message,
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}

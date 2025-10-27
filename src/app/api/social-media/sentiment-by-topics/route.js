/**
 * Social Media Sentiment by Topics API
 * Enhanced endpoint with proper filter processing and response structure
 */

import { NextResponse } from "next/server";
import { db } from "@/index";
import { mentionsClassifyPublic } from "@/lib/schema";
import {
	desc,
	gte,
	lte,
	and,
	sql,
	count,
	sum,
	avg,
	inArray,
	like,
} from "drizzle-orm";

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
			conditions.push(sql`(${sourceConditions.join(" OR ")})`);
		}
	}

	// Topic filters
	if (filters.topics && filters.topics.length > 0) {
		const topicConditions = filters.topics.map((topic) =>
			like(mentionsClassifyPublic.topic, `%${topic}%`)
		);
		if (topicConditions.length === 1) {
			conditions.push(topicConditions[0]);
		} else {
			conditions.push(sql`(${topicConditions.join(" OR ")})`);
		}
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

		console.log("🎯 Sentiment by Topics API - Processing filters:", filters);

		// Build WHERE conditions
		const whereConditions = buildWhereConditions(filters);

		// Base conditions
		const baseConditions = [
			sql`${mentionsClassifyPublic.autosentiment} IS NOT NULL`,
			sql`${mentionsClassifyPublic.topic} IS NOT NULL AND ${mentionsClassifyPublic.topic} != ''`,
		];

		const allConditions = [...baseConditions, ...whereConditions];

		try {
			// Get sentiment counts by topic
			const sentimentByTopics = await db
				.select({
					topic: mentionsClassifyPublic.topic,
					sentiment: mentionsClassifyPublic.autosentiment,
					count: count(),
					avgConfidence: avg(mentionsClassifyPublic.confidence),
				})
				.from(mentionsClassifyPublic)
				.where(and(...allConditions))
				.groupBy(
					mentionsClassifyPublic.topic,
					mentionsClassifyPublic.autosentiment
				)
				.orderBy(desc(count()));

			// Process data into structured format
			const topicsData = {};

			sentimentByTopics.forEach((item) => {
				const topic = item.topic;
				const sentiment = item.sentiment?.toLowerCase();
				const itemCount = parseInt(item.count);

				if (!topicsData[topic]) {
					topicsData[topic] = {
						topic,
						positive: 0,
						negative: 0,
						neutral: 0,
						total: 0,
					};
				}

				if (
					sentiment &&
					["positive", "negative", "neutral"].includes(sentiment)
				) {
					topicsData[topic][sentiment] = itemCount;
					topicsData[topic].total += itemCount;
				}
			});

			// Convert to array and sort by total mentions
			const processedData = Object.values(topicsData)
				.sort((a, b) => b.total - a.total)
				.slice(0, 20); // Limit to top 20 topics

			console.log(
				"📊 Sentiment by Topics data processed:",
				processedData.length,
				"topics"
			);

			const response = {
				success: true,
				data: processedData,
				meta: {
					filters,
					queryTime: new Date().toISOString(),
					dataSource: "database",
					totalTopics: processedData.length,
					totalRecords: processedData.reduce(
						(sum, topic) => sum + topic.total,
						0
					),
				},
			};

			return NextResponse.json(response);
		} catch (dbError) {
			console.error("❌ Database error, using fallback data:", dbError.message);

			// Fallback data when database is unavailable
			const fallbackData = [
				{
					topic: "Technology",
					positive: 45,
					negative: 12,
					neutral: 23,
					total: 80,
				},
				{
					topic: "Healthcare",
					positive: 38,
					negative: 8,
					neutral: 19,
					total: 65,
				},
				{
					topic: "Education",
					positive: 32,
					negative: 15,
					neutral: 18,
					total: 65,
				},
				{
					topic: "Environment",
					positive: 28,
					negative: 20,
					neutral: 12,
					total: 60,
				},
				{
					topic: "Politics",
					positive: 15,
					negative: 35,
					neutral: 10,
					total: 60,
				},
			];

			return NextResponse.json({
				success: true,
				data: fallbackData,
				meta: {
					filters,
					queryTime: new Date().toISOString(),
					dataSource: "fallback",
					warning: "Using fallback data due to database connectivity issues",
					totalTopics: fallbackData.length,
					totalRecords: fallbackData.reduce(
						(sum, topic) => sum + topic.total,
						0
					),
				},
			});
		}
	} catch (error) {
		console.error("🚨 Sentiment by Topics API error:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch sentiment by topics data",
				details: error.message,
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}

/**
 * Sentiment by Source API
 * Provides sentiment breakdown by platform/source
 */

import { NextResponse } from "next/server";
import { db } from "@/index";
import { mentionsClassifyPublic } from "@/lib/schema";
import {
	gte,
	lte,
	and,
	sql,
	count,
	sum,
	avg,
	inArray,
	or,
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

	return conditions;
};

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);

		// Extract filter parameters
		const sentimentsParam = searchParams.get("sentiments");
		const sourcesParam = searchParams.get("sources");
		const dateFromParam = searchParams.get("date_from");
		const dateToParam = searchParams.get("date_to");

		// Process filters
		const filters = {
			sentiments: sentimentsParam ? sentimentsParam.split(",") : [],
			sources: sourcesParam ? sourcesParam.split(",") : [],
			dateRange: {
				from: dateFromParam,
				to: dateToParam,
			},
		};

		console.log("📊 Sentiment by Source API - Processing filters:", filters);

		// Build WHERE conditions
		const whereConditions = buildWhereConditions(filters);

		// Base condition to only include records with valid sentiment
		const baseConditions = [
			sql`${mentionsClassifyPublic.autosentiment} IS NOT NULL`,
			sql`${mentionsClassifyPublic.type} IS NOT NULL`,
		];

		const allConditions = [...baseConditions, ...whereConditions];

		try {
			// Get sentiment by source data
			const sentimentBySource = await db
				.select({
					platform: mentionsClassifyPublic.type,
					sentiment: mentionsClassifyPublic.autosentiment,
					count: count(),
					totalReach: sum(mentionsClassifyPublic.reach),
					avgConfidence: avg(mentionsClassifyPublic.confidence),
				})
				.from(mentionsClassifyPublic)
				.where(and(...allConditions))
				.groupBy(
					mentionsClassifyPublic.type,
					mentionsClassifyPublic.autosentiment
				);

			// Process data into the format expected by the chart
			const platformSentimentMap = {};

			sentimentBySource.forEach((item) => {
				const platform = item.platform || "Unknown";
				const sentiment = item.sentiment?.toLowerCase() || "neutral";

				if (!platformSentimentMap[platform]) {
					platformSentimentMap[platform] = {
						platform,
						positive: 0,
						negative: 0,
						neutral: 0,
						totalReach: 0,
					};
				}

				platformSentimentMap[platform][sentiment] = parseInt(item.count);
				platformSentimentMap[platform].totalReach +=
					parseInt(item.totalReach) || 0;
			});

			const chartData = Object.values(platformSentimentMap);

			console.log(
				"📊 Sentiment by source data processed:",
				chartData.length,
				"platforms"
			);

			const response = {
				success: true,
				data: chartData,
				meta: {
					filters,
					queryTime: new Date().toISOString(),
					dataSource: "database",
					totalPlatforms: chartData.length,
				},
			};

			return NextResponse.json(response);
		} catch (dbError) {
			console.error("❌ Database error, using fallback data:", dbError.message);

			// Fallback data when database is unavailable
			const fallbackData = [
				{
					platform: "Facebook",
					positive: 85,
					negative: 25,
					neutral: 120,
					totalReach: 450000,
				},
				{
					platform: "Twitter",
					positive: 45,
					negative: 35,
					neutral: 60,
					totalReach: 280000,
				},
				{
					platform: "Instagram",
					positive: 65,
					negative: 15,
					neutral: 40,
					totalReach: 320000,
				},
				{
					platform: "LinkedIn",
					positive: 25,
					negative: 5,
					neutral: 30,
					totalReach: 150000,
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
					totalPlatforms: fallbackData.length,
				},
			});
		}
	} catch (error) {
		console.error("🚨 Sentiment by Source API error:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch sentiment by source data",
				details: error.message,
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}

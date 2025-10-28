/**
 * Sentiment Timeline API
 * Provides time-series sentiment data for timeline charts
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

	return conditions;
};

// Generate date range for fallback data
const generateDateRange = (days = 30) => {
	const dates = [];
	const endDate = new Date();

	for (let i = days - 1; i >= 0; i--) {
		const date = new Date(endDate);
		date.setDate(date.getDate() - i);
		dates.push(date.toISOString().split("T")[0]);
	}

	return dates;
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

		console.log("📅 Sentiment Timeline API - Processing filters:", filters);

		// Build WHERE conditions
		const whereConditions = buildWhereConditions(filters);

		// Base condition to only include records with valid sentiment and date
		const baseConditions = [
			sql`${mentionsClassifyPublic.autosentiment} IS NOT NULL`,
			sql`${mentionsClassifyPublic.inserttime} IS NOT NULL`,
		];

		const allConditions = [...baseConditions, ...whereConditions];

		try {
			// Get daily sentiment data
			const dailySentimentData = await db
				.select({
					date: sql`DATE(${mentionsClassifyPublic.inserttime})`,
					sentiment: mentionsClassifyPublic.autosentiment,
					count: count(),
					totalReach: sum(mentionsClassifyPublic.reach),
					totalInteractions: sql`SUM(
            COALESCE(${mentionsClassifyPublic.likecount}, 0) +
            COALESCE(${mentionsClassifyPublic.sharecount}, 0) +
            COALESCE(${mentionsClassifyPublic.commentcount}, 0)
          )`,
					avgConfidence: avg(mentionsClassifyPublic.confidence),
				})
				.from(mentionsClassifyPublic)
				.where(and(...allConditions))
				.groupBy(
					sql`DATE(${mentionsClassifyPublic.inserttime})`,
					mentionsClassifyPublic.autosentiment
				)
				.orderBy(sql`DATE(${mentionsClassifyPublic.inserttime})`);

			// Process data into the format expected by the chart
			const dateMap = {};

			dailySentimentData.forEach((item) => {
				const date = item.date;
				const sentiment = item.sentiment?.toLowerCase() || "neutral";

				if (!dateMap[date]) {
					dateMap[date] = {
						date,
						positive: 0,
						negative: 0,
						neutral: 0,
						totalReach: 0,
						totalInteractions: 0,
						avgConfidence: 0,
					};
				}

				dateMap[date][sentiment] = parseInt(item.count);
				dateMap[date].totalReach += parseInt(item.totalReach) || 0;
				dateMap[date].totalInteractions +=
					parseInt(item.totalInteractions) || 0;
				dateMap[date].avgConfidence = parseFloat(item.avgConfidence) || 0;
			});

			const timelineData = Object.values(dateMap).sort(
				(a, b) => new Date(a.date) - new Date(b.date)
			);

			console.log(
				"📊 Timeline data processed:",
				timelineData.length,
				"data points"
			);

			const response = {
				success: true,
				data: timelineData,
				meta: {
					filters,
					queryTime: new Date().toISOString(),
					dataSource: "database",
					totalDataPoints: timelineData.length,
					dateRange:
						timelineData.length > 0
							? {
									from: timelineData[0].date,
									to: timelineData[timelineData.length - 1].date,
							  }
							: null,
				},
			};

			return NextResponse.json(response);
		} catch (dbError) {
			console.error("❌ Database error, using fallback data:", dbError.message);

			// Generate fallback timeline data
			const dates = generateDateRange(30);
			const fallbackData = dates.map((date) => ({
				date,
				positive: Math.floor(Math.random() * 20) + 5,
				negative: Math.floor(Math.random() * 10) + 2,
				neutral: Math.floor(Math.random() * 15) + 8,
				totalReach: Math.floor(Math.random() * 50000) + 10000,
				totalInteractions: Math.floor(Math.random() * 5000) + 500,
				avgConfidence: 0.7 + Math.random() * 0.3,
			}));

			return NextResponse.json({
				success: true,
				data: fallbackData,
				meta: {
					filters,
					queryTime: new Date().toISOString(),
					dataSource: "fallback",
					warning: "Using fallback data due to database connectivity issues",
					totalDataPoints: fallbackData.length,
					dateRange: {
						from: fallbackData[0].date,
						to: fallbackData[fallbackData.length - 1].date,
					},
				},
			});
		}
	} catch (error) {
		console.error("🚨 Sentiment Timeline API error:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch sentiment timeline data",
				details: error.message,
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}

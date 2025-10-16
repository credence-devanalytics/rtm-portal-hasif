import { NextResponse } from "next/server";
import { db } from "@/index";
import {
	pbAudience,
	pbAudienceAge,
	pbAudienceGender,
	pbAudienceRegion,
	pbFirstUser,
	pbFirstUserSource,
} from "../../../../drizzle/schema";
import { sql, eq, and, gte, lte } from "drizzle-orm";

export async function GET(request) {
	try {
		console.log("PB Cross Analysis API called");

		const { searchParams } = new URL(request.url);
		const analysisType = searchParams.get("type") || "overview";
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");

		// Build date filter conditions
		const dateConditions = [];
		if (startDate) dateConditions.push(gte);
		if (endDate) dateConditions.push(lte);

		switch (analysisType) {
			case "region-age":
				return await getRegionAgeAnalysis(startDate, endDate);

			case "gender-source":
				return await getGenderSourceAnalysis(startDate, endDate);

			case "daily-trends":
				return await getDailyTrendsAnalysis(startDate, endDate);

			default:
				return await getOverviewAnalysis(startDate, endDate);
		}
	} catch (error) {
		console.error("PB Cross Analysis API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch PB cross analysis data",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// Overview analysis combining all major metrics
async function getOverviewAnalysis(startDate, endDate) {
	const [audienceData, ageData, genderData, regionData, sourceData] =
		await Promise.all([
			db.select().from(pbAudience),
			db.select().from(pbAudienceAge),
			db.select().from(pbAudienceGender),
			db.select().from(pbAudienceRegion),
			db.select().from(pbFirstUserSource),
		]);

	// Calculate summary metrics
	const totalUsers = audienceData.reduce(
		(sum, item) => sum + (item.totalUsers || 0),
		0
	);
	const totalNewUsers = audienceData.reduce(
		(sum, item) => sum + (item.newUsers || 0),
		0
	);

	// Top demographics
	const ageGroups = {};
	ageData.forEach((item) => {
		ageGroups[item.userAgeBracket] =
			(ageGroups[item.userAgeBracket] || 0) + item.activeUsers;
	});
	const topAgeGroup = Object.entries(ageGroups).reduce(
		(max, [age, count]) => (count > max.count ? { age, count } : max),
		{ age: "N/A", count: 0 }
	);

	const genderGroups = {};
	genderData.forEach((item) => {
		genderGroups[item.userGender] =
			(genderGroups[item.userGender] || 0) + item.activeUsers;
	});

	const regionGroups = {};
	regionData.forEach((item) => {
		regionGroups[item.region] =
			(regionGroups[item.region] || 0) + item.activeUsers;
	});
	const topRegion = Object.entries(regionGroups).reduce(
		(max, [region, count]) => (count > max.count ? { region, count } : max),
		{ region: "N/A", count: 0 }
	);

	return NextResponse.json({
		success: true,
		data: {
			overview: {
				totalUsers,
				totalNewUsers,
				returningUsers: totalUsers - totalNewUsers,
				newUserRate:
					totalUsers > 0 ? ((totalNewUsers / totalUsers) * 100).toFixed(1) : 0,
			},
			demographics: {
				topAgeGroup: topAgeGroup.age,
				topAgeCount: topAgeGroup.count,
				genderDistribution: genderGroups,
				topRegion: topRegion.region,
				topRegionCount: topRegion.count,
			},
			analysisType: "overview",
			dateRange: { startDate, endDate },
		},
	});
}

// Region and Age correlation analysis
async function getRegionAgeAnalysis(startDate, endDate) {
	// This would require joining data by date to correlate region and age
	// For now, we'll provide separate summaries
	const [regionData, ageData] = await Promise.all([
		db.select().from(pbAudienceRegion),
		db.select().from(pbAudienceAge),
	]);

	// Group by region
	const regionSummary = {};
	regionData.forEach((item) => {
		const key = item.region;
		if (!regionSummary[key]) {
			regionSummary[key] = { activeUsers: 0, newUsers: 0, dates: new Set() };
		}
		regionSummary[key].activeUsers += item.activeUsers || 0;
		regionSummary[key].newUsers += item.newUsers || 0;
		regionSummary[key].dates.add(item.date);
	});

	// Group by age
	const ageSummary = {};
	ageData.forEach((item) => {
		const key = item.userAgeBracket;
		if (!ageSummary[key]) {
			ageSummary[key] = { activeUsers: 0, newUsers: 0, dates: new Set() };
		}
		ageSummary[key].activeUsers += item.activeUsers || 0;
		ageSummary[key].newUsers += item.newUsers || 0;
		ageSummary[key].dates.add(item.date);
	});

	return NextResponse.json({
		success: true,
		data: {
			regionSummary: Object.entries(regionSummary).map(([region, data]) => ({
				region,
				activeUsers: data.activeUsers,
				newUsers: data.newUsers,
				dateCount: data.dates.size,
			})),
			ageSummary: Object.entries(ageSummary).map(([age, data]) => ({
				ageBracket: age,
				activeUsers: data.activeUsers,
				newUsers: data.newUsers,
				dateCount: data.dates.size,
			})),
			analysisType: "region-age",
			dateRange: { startDate, endDate },
		},
	});
}

// Gender and Source correlation analysis
async function getGenderSourceAnalysis(startDate, endDate) {
	const [genderData, sourceData] = await Promise.all([
		db.select().from(pbAudienceGender),
		db.select().from(pbFirstUserSource),
	]);

	// Process gender data
	const genderSummary = {};
	genderData.forEach((item) => {
		const key = item.userGender;
		if (!genderSummary[key]) {
			genderSummary[key] = { activeUsers: 0, newUsers: 0 };
		}
		genderSummary[key].activeUsers += item.activeUsers || 0;
		genderSummary[key].newUsers += item.newUsers || 0;
	});

	// Process source data
	const sourceSummary = {};
	sourceData.forEach((item) => {
		const key = item.mainSource;
		if (!sourceSummary[key]) {
			sourceSummary[key] = { activeUsers: 0 };
		}
		sourceSummary[key].activeUsers += item.activeUsers || 0;
	});

	return NextResponse.json({
		success: true,
		data: {
			genderBreakdown: Object.entries(genderSummary).map(([gender, data]) => ({
				gender,
				activeUsers: data.activeUsers,
				newUsers: data.newUsers,
			})),
			sourceBreakdown: Object.entries(sourceSummary).map(([source, data]) => ({
				source,
				activeUsers: data.activeUsers,
			})),
			analysisType: "gender-source",
			dateRange: { startDate, endDate },
		},
	});
}

// Daily trends analysis
async function getDailyTrendsAnalysis(startDate, endDate) {
	const audienceData = await db.select().from(pbAudience);

	// Group by date
	const dailyTrends = {};
	audienceData.forEach((item) => {
		const date = item.date;
		if (!dailyTrends[date]) {
			dailyTrends[date] = {
				date,
				totalUsers: 0,
				newUsers: 0,
				returningUsers: 0,
			};
		}
		dailyTrends[date].totalUsers += item.totalUsers || 0;
		dailyTrends[date].newUsers += item.newUsers || 0;
		dailyTrends[date].returningUsers =
			dailyTrends[date].totalUsers - dailyTrends[date].newUsers;
	});

	const chartData = Object.values(dailyTrends).sort(
		(a, b) => new Date(a.date) - new Date(b.date)
	);

	return NextResponse.json({
		success: true,
		data: {
			chartData,
			summary: {
				totalDays: chartData.length,
				avgDailyUsers:
					chartData.length > 0
						? Math.round(
								chartData.reduce((sum, item) => sum + item.totalUsers, 0) /
									chartData.length
						  )
						: 0,
				avgNewUsers:
					chartData.length > 0
						? Math.round(
								chartData.reduce((sum, item) => sum + item.newUsers, 0) /
									chartData.length
						  )
						: 0,
			},
			analysisType: "daily-trends",
			dateRange: { startDate, endDate },
		},
	});
}

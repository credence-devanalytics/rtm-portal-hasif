import { NextResponse } from "next/server";
import { db } from "@/index";
import {
	pbAudienceRegion,
	pbAudienceRegionGender,
} from "../../../../drizzle/schema";
import { sql } from "drizzle-orm";

export async function GET(request) {
	try {
		console.log("PB Regional Analysis API called");

		const { searchParams } = new URL(request.url);
		const analysisType = searchParams.get("type") || "region";

		if (analysisType === "region-gender") {
			// Combined region and gender analysis
			const regionGenderData = await db
				.select({
					region: pbAudienceRegionGender.region,
					userGender: pbAudienceRegionGender.userGender,
					totalActiveUsers: sql`SUM(${pbAudienceRegionGender.activeUsers})`.as(
						"totalActiveUsers"
					),
					totalNewUsers: sql`SUM(${pbAudienceRegionGender.newUsers})`.as(
						"totalNewUsers"
					),
					recordCount: sql`COUNT(*)`.as("recordCount"),
				})
				.from(pbAudienceRegionGender)
				.groupBy(
					pbAudienceRegionGender.region,
					pbAudienceRegionGender.userGender
				);

			console.log("PB Region-Gender data:", regionGenderData);

			const chartData = regionGenderData.map((item) => ({
				region: item.region,
				gender: item.userGender,
				activeUsers: parseInt(item.totalActiveUsers) || 0,
				newUsers: parseInt(item.totalNewUsers) || 0,
				recordCount: parseInt(item.recordCount) || 0,
			}));

			// Group by region for summary
			const regionSummary = {};
			chartData.forEach((item) => {
				if (!regionSummary[item.region]) {
					regionSummary[item.region] = { total: 0, female: 0, male: 0 };
				}
				regionSummary[item.region].total += item.activeUsers;
				regionSummary[item.region][item.gender] = item.activeUsers;
			});

			return NextResponse.json({
				success: true,
				data: {
					chartData,
					regionSummary,
					analysisType: "region-gender",
				},
			});
		}

		// Regular region analysis
		const regionData = await db
			.select({
				region: pbAudienceRegion.region,
				totalActiveUsers: sql`SUM(${pbAudienceRegion.activeUsers})`.as(
					"totalActiveUsers"
				),
				totalNewUsers: sql`SUM(${pbAudienceRegion.newUsers})`.as(
					"totalNewUsers"
				),
				recordCount: sql`COUNT(*)`.as("recordCount"),
			})
			.from(pbAudienceRegion)
			.groupBy(pbAudienceRegion.region);

		console.log("PB Region data:", regionData);

		// Process data for charts
		const chartData = regionData.map((item) => ({
			region: item.region,
			activeUsers: parseInt(item.totalActiveUsers) || 0,
			newUsers: parseInt(item.totalNewUsers) || 0,
			recordCount: parseInt(item.recordCount) || 0,
			percentage: 0, // Will calculate after getting totals
		}));

		// Calculate percentages
		const totalUsers = chartData.reduce(
			(sum, item) => sum + item.activeUsers,
			0
		);
		chartData.forEach((item) => {
			item.percentage =
				totalUsers > 0
					? parseFloat(((item.activeUsers / totalUsers) * 100).toFixed(1))
					: 0;
		});

		// Sort by active users descending
		chartData.sort((a, b) => b.activeUsers - a.activeUsers);

		// Find top regions
		const topRegion = chartData[0] || {};
		const topRegions = chartData.slice(0, 5);

		const response = {
			success: true,
			data: {
				chartData,
				summary: {
					totalUsers,
					totalNewUsers: chartData.reduce(
						(sum, item) => sum + item.newUsers,
						0
					),
					topRegion: topRegion.region || "N/A",
					topRegionUsers: topRegion.activeUsers || 0,
					topRegionPercentage: topRegion.percentage || 0,
					regionCount: chartData.length,
					topRegions: topRegions.map((r) => ({
						region: r.region,
						users: r.activeUsers,
						percentage: r.percentage,
					})),
				},
				analysisType: "region",
			},
		};

		console.log("PB Regional Analysis API response:", response);
		return NextResponse.json(response);
	} catch (error) {
		console.error("PB Regional Analysis API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch PB regional analysis data",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

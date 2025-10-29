import { NextResponse } from "next/server";
import { db } from "@/index";
import { pberitaFirstUserSource } from "../../../../drizzle/schema";
import { sql } from "drizzle-orm";

export async function GET(request) {
	try {
		console.log("PB User Source Analysis API called");

		// Get query parameters
		const { searchParams } = new URL(request.url);
		const limit = searchParams.get("limit") || "5"; // Default to top 5
		const limitNum = parseInt(limit);

		// Fetch user source data and group by main source
		const userSourceData = await db
			.select({
				mainSource: pberitaFirstUserSource.mainSource,
				totalActiveUsers: sql`SUM(${pberitaFirstUserSource.activeusers})`.as(
					"totalActiveUsers"
				),
				recordCount: sql`COUNT(*)`.as("recordCount"),
				avgDailyUsers: sql`AVG(${pberitaFirstUserSource.activeusers})`.as(
					"avgDailyUsers"
				),
			})
			.from(pberitaFirstUserSource)
			.groupBy(pberitaFirstUserSource.mainSource)
			.orderBy(sql`SUM(${pberitaFirstUserSource.activeusers}) DESC`)
			.limit(limitNum);

		console.log("PB User Source data:", userSourceData);

		// Process data for table format
		const tableData = userSourceData.map((item, index) => ({
			rank: index + 1,
			sourceName: item.mainSource || "Unknown Source",
			activeUsers: parseInt(item.totalActiveUsers) || 0,
			recordCount: parseInt(item.recordCount) || 0,
			avgDailyUsers: parseFloat(item.avgDailyUsers) || 0,
			formattedActiveUsers: (
				parseInt(item.totalActiveUsers) || 0
			).toLocaleString(),
			percentage: 0, // Will calculate below
		}));

		// Calculate percentages
		const totalUsers = tableData.reduce(
			(sum, item) => sum + item.activeUsers,
			0
		);
		tableData.forEach((item) => {
			item.percentage =
				totalUsers > 0
					? ((item.activeUsers / totalUsers) * 100).toFixed(1)
					: "0.0";
		});

		// Find top source
		const topSource = tableData[0] || {
			sourceName: "No data",
			activeUsers: 0,
			percentage: "0.0",
		};

		const response = {
			success: true,
			data: {
				tableData,
				summary: {
					totalSources: tableData.length,
					totalActiveUsers: totalUsers,
					topSource: {
						name: topSource.sourceName,
						users: topSource.activeusers,
						percentage: topSource.percentage,
					},
					limit: limitNum,
					formattedTotalActiveUsers: totalUsers.toLocaleString(),
				},
			},
		};

		console.log("PB User Source Analysis API response:", response);
		return NextResponse.json(response);
	} catch (error) {
		console.error("PB User Source Analysis API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch PB user source analysis data",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}




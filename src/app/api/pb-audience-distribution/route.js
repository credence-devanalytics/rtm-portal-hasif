import { NextResponse } from "next/server";
import { db } from "@/index";
import { pbAudience } from "../../../../drizzle/schema";
import { sql, ne } from "drizzle-orm";

export async function GET() {
	try {
		console.log("PB Audience Distribution API called");

		// Fetch audience distribution data, excluding 'All Users'
		const audienceDistribution = await db
			.select({
				audienceName: pbAudience.audienceName,
				totalUsers: sql`SUM(${pbAudience.totalUsers})`.as("totalUsers"),
			})
			.from(pbAudience)
			.where(ne(pbAudience.audienceName, "All Users"))
			.groupBy(pbAudience.audienceName)
			.orderBy(sql`SUM(${pbAudience.totalUsers}) DESC`);

		console.log("PB Audience Distribution data:", audienceDistribution);

		// Process data for charts with colors
		const colors = [
			"#3b82f6",
			"#ef4444",
			"#10b981",
			"#f59e0b",
			"#8b5cf6",
			"#ec4899",
			"#06b6d4",
			"#84cc16",
		];

		const chartData = audienceDistribution
			.filter((item) => item.totalUsers > 0) // Only include segments with users
			.map((item, index) => ({
				audienceName: item.audienceName,
				totalUsers: parseInt(item.totalUsers) || 0,
				fill: colors[index % colors.length],
				percentage: 0, // Will be calculated below
			}));

		// Calculate percentages
		const totalAllSegments = chartData.reduce(
			(sum, item) => sum + item.totalUsers,
			0
		);
		chartData.forEach((item) => {
			item.percentage =
				totalAllSegments > 0
					? ((item.totalUsers / totalAllSegments) * 100).toFixed(1)
					: 0;
		});

		// Calculate summary statistics
		const totalSegments = chartData.length;
		const largestSegment = chartData[0] || {
			audienceName: "No data",
			totalUsers: 0,
		};
		const avgUsersPerSegment =
			totalSegments > 0 ? Math.round(totalAllSegments / totalSegments) : 0;

		const response = {
			success: true,
			data: {
				chartData,
				summary: {
					totalSegments,
					totalUsers: totalAllSegments,
					largestSegment: {
						name: largestSegment.audienceName,
						users: largestSegment.totalUsers,
						percentage: largestSegment.percentage,
					},
					avgUsersPerSegment,
					formattedTotalUsers: totalAllSegments.toLocaleString(),
				},
			},
		};

		console.log("PB Audience Distribution API response:", response);
		return NextResponse.json(response);
	} catch (error) {
		console.error("PB Audience Distribution API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch PB audience distribution data",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

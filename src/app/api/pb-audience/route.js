import { NextResponse } from "next/server";
import { db } from "@/index";
import { pberitaAudience } from "../../../../drizzle/schema";
import { desc, sql } from "drizzle-orm";

export async function GET() {
	try {
		console.log("PB Audience API called");

		// Fetch audience data from database
		const audienceData = await db
			.select()
			.from(pberitaAudience)
			.orderBy(desc(pberitaAudience.date));

		console.log("PB Audience data:", audienceData);

		// Process data for charts
		const chartData = audienceData.map((item) => ({
			date: item.date,
			totalUsers: item.totalUsers || 0,
			newUsers: item.newUsers || 0,
			returningUsers: (item.totalUsers || 0) - (item.newUsers || 0),
		}));

		// Calculate summary statistics
		const totalRecords = chartData.length;
		const avgDailyUsers =
			totalRecords > 0
				? Math.round(
						chartData.reduce((sum, item) => sum + item.totalUsers, 0) /
							totalRecords
				  )
				: 0;
		const avgNewUsers =
			totalRecords > 0
				? Math.round(
						chartData.reduce((sum, item) => sum + item.newUsers, 0) /
							totalRecords
				  )
				: 0;

		const response = {
			success: true,
			data: {
				chartData,
				summary: {
					totalRecords,
					avgDailyUsers,
					avgNewUsers,
					latestDate: chartData.length > 0 ? chartData[0].date : null,
					totalUsers: chartData.reduce((sum, item) => sum + item.totalUsers, 0),
					totalNewUsers: chartData.reduce(
						(sum, item) => sum + item.newUsers,
						0
					),
				},
			},
		};

		console.log("PB Audience API response:", response);
		return NextResponse.json(response);
	} catch (error) {
		console.error("PB Audience API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch PB audience data",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}




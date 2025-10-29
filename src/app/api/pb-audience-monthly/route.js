import { NextResponse } from "next/server";
import { db } from "@/index";
import { pberitaAudience } from "../../../../drizzle/schema";
import { asc, sql, gte, and, lte } from "drizzle-orm";

export async function GET() {
	try {
		console.log("PB Audience Monthly API called");

		// Fetch 2025 data only and aggregate by month using SQL
		const monthlyData = await db
			.select({
				month: sql`EXTRACT(MONTH FROM ${pberitaAudience.date})`.as("month"),
				year: sql`EXTRACT(YEAR FROM ${pberitaAudience.date})`.as("year"),
				totalUsers: sql`SUM(${pberitaAudience.totalusers})`.as("totalUsers"),
				newUsers: sql`SUM(${pberitaAudience.newusers})`.as("newUsers"),
			})
			.from(pberitaAudience)
			.where(
				and(
					gte(pberitaAudience.date, "2025-01-01"),
					lte(pberitaAudience.date, "2025-12-31")
				)
			)
			.groupBy(
				sql`EXTRACT(YEAR FROM ${pberitaAudience.date})`,
				sql`EXTRACT(MONTH FROM ${pberitaAudience.date})`
			)
			.orderBy(
				sql`EXTRACT(YEAR FROM ${pberitaAudience.date})`,
				sql`EXTRACT(MONTH FROM ${pberitaAudience.date})`
			);

		console.log("Monthly aggregated data:", monthlyData);

		// Process data for charts
		const chartData = monthlyData.map((item) => {
			const monthNum = parseInt(item.month);
			const yearNum = parseInt(item.year);
			const totalUsers = parseInt(item.totalUsers) || 0;
			const newUsers = parseInt(item.newUsers) || 0;

			return {
				date: `${yearNum}-${String(monthNum).padStart(2, "0")}-01`,
				totalUsers,
				newUsers,
				returningUsers: totalUsers - newUsers,
				month: monthNum,
				year: yearNum,
			};
		});

		const response = {
			success: true,
			data: {
				chartData,
				summary: {
					totalRecords: chartData.length,
					totalUsers: chartData.reduce((sum, item) => sum + item.totalUsers, 0),
					totalNewUsers: chartData.reduce(
						(sum, item) => sum + item.newUsers,
						0
					),
					months: chartData.length,
				},
			},
		};

		console.log("PB Audience Monthly API response:", response);
		return NextResponse.json(response);
	} catch (error) {
		console.error("PB Audience Monthly API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch PB audience monthly data",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}




import { NextResponse } from "next/server";
import { db } from "@/index";
import { pberitaAudience } from "../../../../drizzle/schema";
import { asc, sql, gte, and, lte } from "drizzle-orm";

export async function GET(request) {
	try {
		console.log("PB Audience Monthly API called");

		// Get query parameters for filtering
		const { searchParams } = new URL(request.url);
		const yearParam = searchParams.get("year");
		const monthParam = searchParams.get("month");

		console.log('Filter params:', { yearParam, monthParam });

		// Build date filter conditions
		const dateFilters = [];
		if (monthParam) {
			// Month filter: YYYY-MM format
			const [year, month] = monthParam.split('-');
			const startDate = `${year}-${month}-01`;
			const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
			const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
			dateFilters.push(gte(pberitaAudience.date, startDate));
			dateFilters.push(lte(pberitaAudience.date, endDate));
			console.log('Month filter applied:', { startDate, endDate });
		} else if (yearParam) {
			// Year only filter
			const startDate = `${yearParam}-01-01`;
			const endDate = `${yearParam}-12-31`;
			dateFilters.push(gte(pberitaAudience.date, startDate));
			dateFilters.push(lte(pberitaAudience.date, endDate));
			console.log('Year filter applied:', { startDate, endDate });
		}

		// Fetch data and aggregate by month using SQL
		let monthlyDataQuery = db
			.select({
				month: sql`EXTRACT(MONTH FROM ${pberitaAudience.date})`.as("month"),
				year: sql`EXTRACT(YEAR FROM ${pberitaAudience.date})`.as("year"),
				totalUsers: sql`SUM(${pberitaAudience.totalusers})`.as("totalUsers"),
				newUsers: sql`SUM(${pberitaAudience.newusers})`.as("newUsers"),
			})
			.from(pberitaAudience);

		// Apply date filters if present
		if (dateFilters.length > 0) {
			monthlyDataQuery = monthlyDataQuery.where(and(...dateFilters));
		}

		monthlyDataQuery = monthlyDataQuery
			.groupBy(
				sql`EXTRACT(YEAR FROM ${pberitaAudience.date})`,
				sql`EXTRACT(MONTH FROM ${pberitaAudience.date})`
			)
			.orderBy(
				sql`EXTRACT(YEAR FROM ${pberitaAudience.date})`,
				sql`EXTRACT(MONTH FROM ${pberitaAudience.date})`
			);

		const monthlyData = await monthlyDataQuery;

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




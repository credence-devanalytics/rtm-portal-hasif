import { NextResponse } from "next/server";
import { db } from "@/index";
import { pberitaAudienceAge } from "../../../../drizzle/schema";
import { sql, and, gte, lte } from "drizzle-orm";

export async function GET(request) {
	try {
		console.log("PB Age Demographics API called");

		// Get query parameters for filtering
		const { searchParams } = new URL(request.url);
		const yearParam = searchParams.get("year");
		const monthParam = searchParams.get("month");
		const fromParam = searchParams.get("from");
		const toParam = searchParams.get("to");

		console.log('Filter params:', { yearParam, monthParam, fromParam, toParam });

		// Build date filter conditions
		const dateFilters = [];
		if (fromParam && toParam) {
			// Date range filter: from and to in YYYY-MM-DD format
			dateFilters.push(gte(pberitaAudienceAge.date, fromParam));
			dateFilters.push(lte(pberitaAudienceAge.date, toParam));
			console.log('Date range filter applied:', { fromParam, toParam });
		} else if (monthParam) {
			// Month filter: YYYY-MM format
			const [year, month] = monthParam.split('-');
			const startDate = `${year}-${month}-01`;
			const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
			const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
			dateFilters.push(gte(pberitaAudienceAge.date, startDate));
			dateFilters.push(lte(pberitaAudienceAge.date, endDate));
			console.log('Month filter applied:', { startDate, endDate });
		} else if (yearParam) {
			// Year only filter
			const startDate = `${yearParam}-01-01`;
			const endDate = `${yearParam}-12-31`;
			dateFilters.push(gte(pberitaAudienceAge.date, startDate));
			dateFilters.push(lte(pberitaAudienceAge.date, endDate));
			console.log('Year filter applied:', { startDate, endDate });
		}

		// Fetch age demographics data and group by age bracket
		let ageDataQuery = db
			.select({
				userAgeBracket: pberitaAudienceAge.useragebracket,
				totalActiveUsers: sql`SUM(${pberitaAudienceAge.activeusers})`.as(
					"totalActiveUsers"
				),
				totalNewUsers: sql`SUM(${pberitaAudienceAge.newusers})`.as("totalNewUsers"),
				recordCount: sql`COUNT(*)`.as("recordCount"),
			})
			.from(pberitaAudienceAge);

		// Apply date filters if present
		if (dateFilters.length > 0) {
			ageDataQuery = ageDataQuery.where(and(...dateFilters));
		}

		ageDataQuery = ageDataQuery.groupBy(pberitaAudienceAge.useragebracket);

		const ageData = await ageDataQuery;

		console.log("PB Age data:", ageData);

		// Process data for charts
		const chartData = ageData.map((item) => ({
			ageBracket: item.userAgeBracket,
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

		// Sort by age bracket for better visualization
		chartData.sort((a, b) => {
			const ageOrder = {
				"18-24": 1,
				"25-34": 2,
				"35-44": 3,
				"45-54": 4,
				"55-64": 5,
				"65+": 6,
			};
			return (ageOrder[a.ageBracket] || 999) - (ageOrder[b.ageBracket] || 999);
		});

		// Find dominant age group
		const dominantAgeGroup = chartData.reduce(
			(max, item) => (item.activeUsers > max.activeusers ? item : max),
			chartData[0] || {}
		);

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
					dominantAgeGroup: dominantAgeGroup.ageBracket || "N/A",
					dominantPercentage: dominantAgeGroup.percentage || 0,
					ageGroupCount: chartData.length,
				},
			},
		};

		console.log("PB Age Demographics API response:", response);
		return NextResponse.json(response);
	} catch (error) {
		console.error("PB Age Demographics API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch PB age demographics data",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}




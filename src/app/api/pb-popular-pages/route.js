import { NextResponse } from "next/server";
import { db } from "@/index";
import { pberitaPopularPages } from "../../../../drizzle/schema";
import { sql, and, gte, lte } from "drizzle-orm";

export async function GET(request) {
	try {
		console.log("PB Popular Pages API called");

		// Get query parameters
		const { searchParams } = new URL(request.url);
		const limit = searchParams.get("limit") || "10"; // Default to top 10
		const limitNum = parseInt(limit);
		const yearParam = searchParams.get("year");
		const monthParam = searchParams.get("month");
		const fromParam = searchParams.get("from");
		const toParam = searchParams.get("to");

		console.log('Filter params:', { limit, yearParam, monthParam, fromParam, toParam });

		// Build date filter conditions
		const dateFilters = [];

		if (fromParam && toParam) {
			// Date range filter: from and to in YYYY-MM-DD format
			dateFilters.push(gte(pberitaPopularPages.date, fromParam));
			dateFilters.push(lte(pberitaPopularPages.date, toParam));
			console.log('Date range filter applied:', { fromParam, toParam });
		} else if (monthParam) {
			// Month filter: YYYY-MM format
			const [year, month] = monthParam.split('-');
			const startDate = `${year}-${month}-01`;
			const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
			const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
			dateFilters.push(gte(pberitaPopularPages.date, startDate));
			dateFilters.push(lte(pberitaPopularPages.date, endDate));
			console.log('Month filter applied:', { startDate, endDate });
		} else if (yearParam) {
			// Year only filter
			const startDate = `${yearParam}-01-01`;
			const endDate = `${yearParam}-12-31`;
			dateFilters.push(gte(pberitaPopularPages.date, startDate));
			dateFilters.push(lte(pberitaPopularPages.date, endDate));
			console.log('Year filter applied:', { startDate, endDate });
		}

		// Fetch popular pages data
		let popularPagesQuery = db
			.select({
				unifiedScreenClass: pberitaPopularPages.unifiedscreenclass,
				screenPageViews: sql`SUM(${pberitaPopularPages.screenpageviews})`.as(
					"screenPageViews"
				),
				activeUsers: sql`SUM(${pberitaPopularPages.activeusers})`.as("activeUsers"),
			})
			.from(pberitaPopularPages);

		// Apply date filters if present
		if (dateFilters.length > 0) {
			popularPagesQuery = popularPagesQuery.where(and(...dateFilters));
		}

		popularPagesQuery = popularPagesQuery
			.groupBy(pberitaPopularPages.unifiedscreenclass)
			.orderBy(sql`SUM(${pberitaPopularPages.screenpageviews}) DESC`)
			.limit(limitNum);

		const popularPages = await popularPagesQuery;

		console.log("PB Popular Pages data:", popularPages);

		// Process data for table
		const tableData = popularPages.map((item, index) => ({
			rank: index + 1,
			pageName: item.unifiedScreenClass || "Unknown Page",
			screenPageViews: parseInt(item.screenPageViews) || 0,
			activeUsers: parseInt(item.activeUsers) || 0,
			avgViewsPerUser:
				parseInt(item.activeUsers) > 0
					? (
						(parseInt(item.screenPageViews) || 0) /
						(parseInt(item.activeUsers) || 1)
					).toFixed(2)
					: "0.00",
		}));

		// Calculate summary statistics
		const totalPageViews = tableData.reduce(
			(sum, item) => sum + item.screenPageViews,
			0
		);
		const totalActiveUsers = tableData.reduce(
			(sum, item) => sum + item.activeUsers,
			0
		);
		const avgPageViews =
			tableData.length > 0 ? Math.round(totalPageViews / tableData.length) : 0;
		const topPage = tableData[0] || { pageName: "No data", screenPageViews: 0 };

		const response = {
			success: true,
			data: {
				tableData,
				summary: {
					totalPages: tableData.length,
					totalPageViews,
					totalActiveUsers,
					topPage: {
						name: topPage.pageName,
						pageViews: topPage.screenPageViews,
						users: topPage.activeUsers,
					},
					avgPageViews,
					limit: limitNum,
					formattedTotalPageViews: totalPageViews.toLocaleString(),
					formattedTotalActiveUsers: totalActiveUsers.toLocaleString(),
				},
			},
		};

		console.log("PB Popular Pages API response:", response);
		return NextResponse.json(response);
	} catch (error) {
		console.error("PB Popular Pages API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch PB popular pages data",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}




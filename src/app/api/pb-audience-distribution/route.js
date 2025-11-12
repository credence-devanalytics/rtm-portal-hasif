import { NextResponse } from "next/server";
import { db } from "@/index";
import { pberitaAudience } from "../../../../drizzle/schema";
import { sql, ne, and, gte, lte } from "drizzle-orm";

export async function GET(request) {
	try {
		console.log("PB Audience Distribution API called");

		// Get query parameters for filtering
		const { searchParams } = new URL(request.url);
		const yearParam = searchParams.get("year");
		const monthParam = searchParams.get("month");
		const fromParam = searchParams.get("from");
		const toParam = searchParams.get("to");

		console.log('Filter params:', { yearParam, monthParam, fromParam, toParam });

		// Build date filter conditions
		const dateFilters = [ne(pberitaAudience.audiencename, "All Users")];

		if (fromParam && toParam) {
			// Date range filter: from and to in YYYY-MM-DD format
			dateFilters.push(gte(pberitaAudience.date, fromParam));
			dateFilters.push(lte(pberitaAudience.date, toParam));
			console.log('Date range filter applied:', { fromParam, toParam });
		} else if (monthParam) {
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

		// Fetch audience distribution data, excluding 'All Users'
		const audienceDistribution = await db
			.select({
				audienceName: pberitaAudience.audiencename,
				totalUsers: sql`SUM(${pberitaAudience.totalusers})`.as("totalUsers"),
			})
			.from(pberitaAudience)
			.where(and(...dateFilters))
			.groupBy(pberitaAudience.audiencename)
			.orderBy(sql`SUM(${pberitaAudience.totalusers}) DESC`);

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




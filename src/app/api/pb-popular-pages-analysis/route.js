import { NextResponse } from "next/server";
import { db } from "@/index";
import { pbPopularPages } from "../../../../drizzle/schema";
import { sql } from "drizzle-orm";

export async function GET() {
	try {
		console.log("PB Popular Pages Analysis API called");

		// Fetch popular pages data and group by page
		const popularPagesData = await db
			.select({
				pageName: pbPopularPages.unifiedScreenClass,
				totalPageViews: sql`SUM(${pbPopularPages.screenPageViews})`.as(
					"totalPageViews"
				),
				totalActiveUsers: sql`SUM(${pbPopularPages.activeUsers})`.as(
					"totalActiveUsers"
				),
				recordCount: sql`COUNT(*)`.as("recordCount"),
				avgPageViews: sql`AVG(${pbPopularPages.screenPageViews})`.as(
					"avgPageViews"
				),
				avgActiveUsers: sql`AVG(${pbPopularPages.activeUsers})`.as(
					"avgActiveUsers"
				),
			})
			.from(pbPopularPages)
			.groupBy(pbPopularPages.unifiedScreenClass);

		console.log("PB Popular Pages data:", popularPagesData);

		// Process data for charts
		const chartData = popularPagesData.map((item) => ({
			pageName: item.pageName,
			totalPageViews: parseInt(item.totalPageViews) || 0,
			totalActiveUsers: parseInt(item.totalActiveUsers) || 0,
			recordCount: parseInt(item.recordCount) || 0,
			avgPageViews: parseFloat(item.avgPageViews) || 0,
			avgActiveUsers: parseFloat(item.avgActiveUsers) || 0,
			viewsPerUser: 0, // Will calculate below
			percentage: 0, // Will calculate after getting totals
		}));

		// Calculate views per user and percentages
		const totalPageViews = chartData.reduce(
			(sum, item) => sum + item.totalPageViews,
			0
		);
		chartData.forEach((item) => {
			item.viewsPerUser =
				item.totalActiveUsers > 0
					? parseFloat((item.totalPageViews / item.totalActiveUsers).toFixed(2))
					: 0;
			item.percentage =
				totalPageViews > 0
					? parseFloat(
							((item.totalPageViews / totalPageViews) * 100).toFixed(1)
					  )
					: 0;
		});

		// Sort by total page views descending
		chartData.sort((a, b) => b.totalPageViews - a.totalPageViews);

		// Find top pages
		const topPage = chartData[0] || {};
		const topPages = chartData.slice(0, 10); // Top 10 pages

		// Extract clean page titles (remove " - Portal Berita" suffix if present)
		const cleanChartData = chartData.map((item) => ({
			...item,
			cleanPageName: item.pageName
				? item.pageName.replace(" - Portal Berita", "")
				: "Unknown Page",
		}));

		const response = {
			success: true,
			data: {
				chartData: cleanChartData,
				summary: {
					totalPageViews,
					totalActiveUsers: chartData.reduce(
						(sum, item) => sum + item.totalActiveUsers,
						0
					),
					topPage: topPage.pageName
						? topPage.pageName.replace(" - Portal Berita", "")
						: "N/A",
					topPageViews: topPage.totalPageViews || 0,
					topPagePercentage: topPage.percentage || 0,
					pageCount: chartData.length,
					topPages: topPages.map((p) => ({
						page: p.pageName
							? p.pageName.replace(" - Portal Berita", "")
							: "Unknown",
						views: p.totalPageViews,
						users: p.totalActiveUsers,
						percentage: p.percentage,
						viewsPerUser: p.viewsPerUser,
					})),
					avgViewsPerPage:
						chartData.length > 0
							? Math.round(totalPageViews / chartData.length)
							: 0,
					avgViewsPerUser:
						chartData.length > 0
							? parseFloat(
									(
										chartData.reduce(
											(sum, item) => sum + item.viewsPerUser,
											0
										) / chartData.length
									).toFixed(2)
							  )
							: 0,
				},
			},
		};

		console.log("PB Popular Pages Analysis API response:", response);
		return NextResponse.json(response);
	} catch (error) {
		console.error("PB Popular Pages Analysis API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch PB popular pages analysis data",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

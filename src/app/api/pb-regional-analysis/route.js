import { NextResponse } from "next/server";
import { db } from "@/index";
import {
	pberitaAudienceRegion,
	pberitaAudienceRegionGender,
} from "../../../../drizzle/schema";
import { sql, and, gte, lte } from "drizzle-orm";

export async function GET(request) {
	try {
		console.log("PB Regional Analysis API called");

		const { searchParams } = new URL(request.url);
		const analysisType = searchParams.get("type") || "region";
		const yearParam = searchParams.get("year");
		const monthParam = searchParams.get("month");
		const fromParam = searchParams.get("from");
		const toParam = searchParams.get("to");

		console.log('Filter params:', { analysisType, yearParam, monthParam, fromParam, toParam });

		// Build date filter conditions
		const regionDateFilters = [];
		const regionGenderDateFilters = [];

		if (fromParam && toParam) {
			// Date range filter: from and to in YYYY-MM-DD format
			regionDateFilters.push(gte(pberitaAudienceRegion.date, fromParam));
			regionDateFilters.push(lte(pberitaAudienceRegion.date, toParam));
			regionGenderDateFilters.push(gte(pberitaAudienceRegionGender.date, fromParam));
			regionGenderDateFilters.push(lte(pberitaAudienceRegionGender.date, toParam));
			console.log('Date range filter applied:', { fromParam, toParam });
		} else if (monthParam) {
			// Month filter: YYYY-MM format
			const [year, month] = monthParam.split('-');
			const startDate = `${year}-${month}-01`;
			const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
			const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

			regionDateFilters.push(gte(pberitaAudienceRegion.date, startDate));
			regionDateFilters.push(lte(pberitaAudienceRegion.date, endDate));
			regionGenderDateFilters.push(gte(pberitaAudienceRegionGender.date, startDate));
			regionGenderDateFilters.push(lte(pberitaAudienceRegionGender.date, endDate));

			console.log('Month filter applied:', { startDate, endDate });
		} else if (yearParam) {
			// Year only filter
			const startDate = `${yearParam}-01-01`;
			const endDate = `${yearParam}-12-31`;

			regionDateFilters.push(gte(pberitaAudienceRegion.date, startDate));
			regionDateFilters.push(lte(pberitaAudienceRegion.date, endDate));
			regionGenderDateFilters.push(gte(pberitaAudienceRegionGender.date, startDate));
			regionGenderDateFilters.push(lte(pberitaAudienceRegionGender.date, endDate));

			console.log('Year filter applied:', { startDate, endDate });
		}

		if (analysisType === "region-gender") {
			// Combined region and gender analysis
			let regionGenderQuery = db
				.select({
					region: pberitaAudienceRegionGender.region,
					userGender: pberitaAudienceRegionGender.usergender,
					totalActiveUsers: sql`SUM(${pberitaAudienceRegionGender.activeusers})`.as(
						"totalActiveUsers"
					),
					totalNewUsers: sql`SUM(${pberitaAudienceRegionGender.newusers})`.as(
						"totalNewUsers"
					),
					recordCount: sql`COUNT(*)`.as("recordCount"),
				})
				.from(pberitaAudienceRegionGender);

			// Apply date filters if present
			if (regionGenderDateFilters.length > 0) {
				regionGenderQuery = regionGenderQuery.where(and(...regionGenderDateFilters));
			}

			regionGenderQuery = regionGenderQuery.groupBy(
				pberitaAudienceRegionGender.region,
				pberitaAudienceRegionGender.usergender
			);

			const regionGenderData = await regionGenderQuery;

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
		let regionDataQuery = db
			.select({
				region: pberitaAudienceRegion.region,
				totalActiveUsers: sql`SUM(${pberitaAudienceRegion.activeusers})`.as(
					"totalActiveUsers"
				),
				totalNewUsers: sql`SUM(${pberitaAudienceRegion.newusers})`.as(
					"totalNewUsers"
				),
				recordCount: sql`COUNT(*)`.as("recordCount"),
			})
			.from(pberitaAudienceRegion);

		// Apply date filters if present
		if (regionDateFilters.length > 0) {
			regionDataQuery = regionDataQuery.where(and(...regionDateFilters));
		}

		regionDataQuery = regionDataQuery.groupBy(pberitaAudienceRegion.region);

		const regionData = await regionDataQuery;

		console.log("PB Region data:", regionData);

		// Process data for charts - filter out "(not set)" and invalid regions
		const chartData = regionData
			.filter((item) => {
				const region = item.region?.trim().toLowerCase();
				return (
					region &&
					region !== "(not set)" &&
					region !== "not set" &&
					region !== "" &&
					region !== "unknown" &&
					region !== "n/a"
				);
			})
			.map((item) => ({
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




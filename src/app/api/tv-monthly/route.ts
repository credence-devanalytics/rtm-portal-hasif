import { NextResponse } from "next/server";
import { db } from "@/index";
import { sql } from "drizzle-orm";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const yearParam = searchParams.get("year");
		const monthParam = searchParams.get("month");
		const monthOnlyParam = searchParams.get("month_only");

		console.log("TV Monthly Marketing API called");
		console.log("Filter params:", { yearParam, monthParam, monthOnlyParam });

		// Build WHERE clause with filters
		let whereClause = `WHERE report_type = 'Chart 2'`;

		if (yearParam && yearParam !== "all") {
			whereClause += ` AND year = ${parseInt(yearParam)}`;
			console.log("Filtering by year:", yearParam);
		}

		// Map month number to Malay month name
		const monthNames: Record<string, string> = {
			'01': 'Januari', '02': 'Februari', '03': 'Mac', '04': 'April',
			'05': 'Mei', '06': 'Jun', '07': 'Julai', '08': 'Ogos',
			'09': 'September', '10': 'Oktober', '11': 'November', '12': 'Disember'
		};

		if (monthOnlyParam && monthOnlyParam !== "all") {
			// Filter by specific month across all years
			const monthName = monthNames[monthOnlyParam];
			whereClause += ` AND month = '${monthName}'`;
			console.log("Filtering by month only:", monthName);
		} else if (monthParam && monthParam !== "all") {
			const [year, month] = monthParam.split('-');
			const monthName = monthNames[month];
			whereClause += ` AND month = '${monthName}'`;
			if (year) {
				whereClause += ` AND year = ${parseInt(year)}`;
			}
			console.log("Filtering by month:", monthName, "year:", year);
		}

		// Fetch TV monthly data from database using raw SQL with filters
		const query = `SELECT * FROM marketing_channel_bymonth ${whereClause}`;
		console.log("Executing query:", query);

		const result = await db.execute(sql.raw(query));
		const monthlyData = result.rows;

		console.log("Monthly TV data:", monthlyData);

		// Group data by year and month
		const processedData: Record<string, any> = {};

		// Month order mapping for proper sorting
		const monthOrder: Record<string, number> = {
			Januari: 1,
			Februari: 2,
			Mac: 3,
			April: 4,
			Mei: 5,
			Jun: 6,
			Julai: 7,
			Ogos: 8,
			September: 9,
			Oktober: 10,
			November: 11,
			Disember: 12,
		};

		monthlyData.forEach((item: any) => {
			const year = item.year;
			const month = item.month;
			const value = parseFloat(String(item.value)) || 0;

			if (!processedData[month]) {
				processedData[month] = {
					month: month,
					monthName: getMonthName(monthOrder[month] || 1),
					monthOrder: monthOrder[month] || 999,
					2022: 0,
					2023: 0,
					2024: 0,
				};
			}
			if (year === 2022) processedData[month][2022] += value;
			if (year === 2023) processedData[month][2023] += value;
			if (year === 2024) processedData[month][2024] += value;
		});

		// Build chartData array sorted by monthOrder
		const chartData = Object.values(processedData).sort(
			(a, b) => (a as any).monthOrder - (b as any).monthOrder
		);

		// Calculate yearly totals
		const yearlyTotals = {
			2022: chartData.reduce(
				(sum, item) => Number(sum) + (Number((item as any)["2022"]) || 0),
				0
			),
			2023: chartData.reduce(
				(sum, item) => Number(sum) + (Number((item as any)["2023"]) || 0),
				0
			),
			2024: chartData.reduce(
				(sum, item) => Number(sum) + (Number((item as any)["2024"]) || 0),
				0
			),
		};

		// Calculate growth rates
		const growth2022to2023 =
			Number(yearlyTotals[2022]) > 0
				? ((Number(yearlyTotals[2023]) - Number(yearlyTotals[2022])) /
					Number(yearlyTotals[2022])) *
				100
				: 0;

		const growth2023to2024 =
			Number(yearlyTotals[2023]) > 0
				? ((Number(yearlyTotals[2024]) - Number(yearlyTotals[2023])) /
					Number(yearlyTotals[2023])) *
				100
				: 0;

		const response = {
			success: true,
			data: {
				chartData,
				summary: {
					yearlyTotals,
					growth2022to2023: growth2022to2023.toFixed(1),
					growth2023to2024: growth2023to2024.toFixed(1),
					totalMonths: chartData.length,
					formattedTotals: {
						2022: formatCurrency(yearlyTotals[2022]),
						2023: formatCurrency(yearlyTotals[2023]),
						2024: formatCurrency(yearlyTotals[2024]),
					},
				},
			},
		};

		console.log("TV Monthly API response:", response);
		return NextResponse.json(response);
	} catch (error) {
		console.error("TV Monthly API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch TV monthly data",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
// Helper function to get month name
function getMonthName(monthNumber) {
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	return months[monthNumber - 1] || monthNumber.toString();
}

// Helper function to format currency
function formatCurrency(value) {
	return new Intl.NumberFormat("en-MY", {
		style: "currency",
		currency: "MYR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}

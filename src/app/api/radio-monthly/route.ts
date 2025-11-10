import { db } from "@/index";
import { sql } from "drizzle-orm";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const yearParam = searchParams.get("year");
		const monthParam = searchParams.get("month");
		const monthOnlyParam = searchParams.get("month_only");

		console.log("Radio Monthly Marketing API called");
		console.log("Filter params:", { yearParam, monthParam, monthOnlyParam });

		// Build WHERE clause with filters
		let whereClause = `WHERE report_type = 'Chart 4'`;

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

		const query = `SELECT * FROM marketing_channel_bymonth ${whereClause}`;
		console.log("Executing query:", query);

		const result = await db.execute(sql.raw(query));
		const monthlyData = result.rows;

		console.log("Radio monthly data:", monthlyData);

		// Process the data by month and year
		const processedData: Record<string, any> = {};

		// Month order mapping
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

		// Group data by month and year
		monthlyData.forEach((row: any) => {
			const month = row.month;
			const year = row.year;
			const value = parseFloat(String(row.value)) || 0;

			if (!processedData[month]) {
				processedData[month] = {
					month,
					monthOrder: monthOrder[month] || 999,
				};
			}

			processedData[month][year] = value;
		});

		// Convert to array and sort by month order
		const chartData = Object.values(processedData)
			.sort((a, b) => (a as any).monthOrder - (b as any).monthOrder)
			.map((item) => {
				const { monthOrder, ...rest } = item as any;
				return rest;
			});

		console.log("Radio processed chart data:", chartData);

		return Response.json({
			success: true,
			data: chartData,
		});
	} catch (error) {
		console.error("Radio Monthly API error:", error);
		return Response.json(
			{
				success: false,
				error: "Failed to fetch radio monthly data",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

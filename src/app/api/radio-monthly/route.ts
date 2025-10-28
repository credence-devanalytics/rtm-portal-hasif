import { db } from "@/index";
import { sql } from "drizzle-orm";

export async function GET() {
	try {
		console.log("Radio Monthly Marketing API called");

		const result = await db.execute(sql`
			SELECT * FROM marketing_channel_bymonth WHERE report_type = 'Chart 4'
		`);
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

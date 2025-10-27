import { NextResponse } from 'next/server';
import { db } from '@/index';
import { sql } from 'drizzle-orm';

export async function GET() {
	try {
		console.log("=== Marketing API called ===");
		console.log("Database connection:", db ? "Connected" : "Not connected");
		
		// First, check what data exists in the table using raw SQL
		let allData;
		try {
			const result = await db.execute(sql`
				SELECT * FROM marketing_channel_byyear LIMIT 10
			`);
			allData = result.rows;
			
			console.log("Sample data from table:", JSON.stringify(allData, null, 2));
			console.log("Total sample records:", allData.length);
		} catch (dbError) {
			console.error("Error fetching sample data:", dbError);
			return NextResponse.json({
				success: false,
				error: "Database query failed",
				details: dbError.message
			}, { status: 500 });
		}
		
		// Extract unique years and report types from sample data
		const years = [...new Set(allData.map(item => item.year))];
		const reportTypes = [...new Set(allData.map(item => item.report_type))];
		
		console.log("Years in sample data:", years);
		console.log("Report types in sample data:", reportTypes);

		// Fetch 2024 data from database (only Table 1)
		const result2024 = await db.execute(sql`
			SELECT * FROM marketing_channel_byyear WHERE year = 2024 AND report_type = 'Table 1'
		`);
		const currentYearData = result2024.rows;

		console.log("2024 data count:", currentYearData.length);
		console.log("2024 data sample:", currentYearData[0]);

		// Fetch 2023 data from database (only Table 1)
		const result2023 = await db.execute(sql`
			SELECT * FROM marketing_channel_byyear WHERE year = 2023 AND report_type = 'Table 1'
		`);
		const previousYearData = result2023.rows;

		console.log("2023 data count:", previousYearData.length);

		// Fetch 2022 data from database (only Table 1)
		const result2022 = await db.execute(sql`
			SELECT * FROM marketing_channel_byyear WHERE year = 2022 AND report_type = 'Table 1'
		`);
		const year2022Data = result2022.rows;

		console.log("2022 data count:", year2022Data.length);
		
		// If no 2024 data, return empty response
		if (currentYearData.length === 0) {
			console.log("No 2024 data found in database");
			return NextResponse.json({
				success: false,
				error: "No data available for 2024",
				data: null
			});
		}

    // Create a map for easy lookup of previous year data
    const previousYearMap: Record<string, number> = {};
    previousYearData.forEach((item: any) => {
      previousYearMap[item.saluran] = Number(item.value) || 0;
    });

    // Create a map for easy lookup of 2022 data
    const year2022Map: Record<string, number> = {};
    year2022Data.forEach((item: any) => {
      year2022Map[item.saluran] = Number(item.value) || 0;
    });

    // Calculate percentage change and prepare metrics
    const saluranMetrics = currentYearData.map((item: any) => {
      const currentValue = Number(item.value) || 0;
      const previousValue = previousYearMap[item.saluran] || 0;
      const year2022Value = year2022Map[item.saluran] || 0;
      
      let percentageChange = 0;
      let changeDirection = 'no change';
      
      if (previousValue > 0) {
        percentageChange = ((currentValue - previousValue) / previousValue) * 100;
        changeDirection = percentageChange > 0 ? 'increase' : percentageChange < 0 ? 'decrease' : 'no change';
      } else if (currentValue > 0) {
        percentageChange = 100; // New saluran
        changeDirection = 'new';
      }

			return {
				saluran: item.saluran,
				currentValue: currentValue,
				previousValue: previousValue,
				year2022Value: year2022Value,
				percentageChange: Math.abs(percentageChange),
				changeDirection: changeDirection,
				formattedChange: `${
					percentageChange > 0 ? "+" : ""
				}${percentageChange.toFixed(1)}%`,
				formattedCurrentValue: currentValue.toLocaleString("en-MY", {
					style: "currency",
					currency: "MYR",
					minimumFractionDigits: 0,
					maximumFractionDigits: 0,
				}),
				formattedPreviousValue: previousValue.toLocaleString("en-MY", {
					style: "currency",
					currency: "MYR",
					minimumFractionDigits: 0,
					maximumFractionDigits: 0,
				}),
				formatted2022Value: year2022Value.toLocaleString("en-MY", {
					style: "currency",
					currency: "MYR",
					minimumFractionDigits: 0,
					maximumFractionDigits: 0,
				}),
			};
		});

		// Calculate totals
		const totalCurrent = saluranMetrics.reduce(
			(sum, item) => sum + item.currentValue,
			0
		);
		const totalPrevious = saluranMetrics.reduce(
			(sum, item) => sum + item.previousValue,
			0
		);
		const total2022 = saluranMetrics.reduce(
			(sum, item) => sum + item.year2022Value,
			0
		);
		const overallChange =
			totalPrevious > 0
				? ((totalCurrent - totalPrevious) / totalPrevious) * 100
				: 0;

		const response = {
			success: true,
			data: {
				saluranMetrics: saluranMetrics,
				summary: {
					totalCurrent,
					totalPrevious,
					total2022,
					overallChange: overallChange.toFixed(1),
					overallDirection:
						overallChange > 0
							? "increase"
							: overallChange < 0
							? "decrease"
							: "no change",
					topSaluran: saluranMetrics[0] || null,
					totalSaluran: saluranMetrics.length,
					activeSaluran: saluranMetrics.length,
					discontinuedSaluran: 0,
					formattedTotalCurrent: totalCurrent.toLocaleString("en-MY", {
						style: "currency",
						currency: "MYR",
						minimumFractionDigits: 0,
						maximumFractionDigits: 0,
					}),
					formattedTotalPrevious: totalPrevious.toLocaleString("en-MY", {
						style: "currency",
						currency: "MYR",
						minimumFractionDigits: 0,
						maximumFractionDigits: 0,
					}),
					formattedTotal2022: total2022.toLocaleString("en-MY", {
						style: "currency",
						currency: "MYR",
						minimumFractionDigits: 0,
						maximumFractionDigits: 0,
					}),
				},
				year: {
					current: 2024,
					previous: 2023,
					year2022: 2022,
				},
			},
		};

		console.log("Marketing API response:", response);
		return NextResponse.json(response);
	} catch (error) {
		console.error("Marketing API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch marketing data",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

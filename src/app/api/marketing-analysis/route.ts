import { NextResponse } from 'next/server';
import { db } from '@/index';
import { sql } from 'drizzle-orm';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const yearParam = searchParams.get("year");
		const monthParam = searchParams.get("month");
		const monthOnlyParam = searchParams.get("month_only");

		console.log("=== Marketing API called ===");
		console.log("Filter params:", { yearParam, monthParam, monthOnlyParam });
		console.log("Database connection:", db ? "Connected" : "Not connected");

		// Determine which years to fetch based on filters
		let yearsToFetch = [2022, 2023, 2024];
		if (yearParam && yearParam !== "all") {
			yearsToFetch = [parseInt(yearParam)];
			console.log("Filtering by year:", yearParam);
		}

		// Map month number to Malay month name
		const monthNames: Record<string, string> = {
			'01': 'Januari', '02': 'Februari', '03': 'Mac', '04': 'April',
			'05': 'Mei', '06': 'Jun', '07': 'Julai', '08': 'Ogos',
			'09': 'September', '10': 'Oktober', '11': 'November', '12': 'Disember'
		};

		// Fetch data for each year based on filter
		const fetchYearData = async (year: number) => {
			if (yearParam && yearParam !== "all" && parseInt(yearParam) !== year) {
				return [];
			}

			// If month_only is specified, fetch from bymonth table and aggregate
			if (monthOnlyParam && monthOnlyParam !== "all") {
				const monthName = monthNames[monthOnlyParam];
				console.log(`Fetching month-only data for ${monthName} ${year}`);
				const result = await db.execute(
					sql`SELECT saluran, SUM(CAST(value AS NUMERIC)) as value 
					    FROM marketing_channel_bymonth 
					    WHERE year = ${year} 
					      AND month = ${monthName}
					      AND report_type = 'Table 1'
					    GROUP BY saluran`
				);
				return result.rows;
			}

			// Otherwise fetch yearly data
			const result = await db.execute(
				sql`SELECT * FROM marketing_channel_byyear WHERE year = ${year} AND report_type = 'Table 1'`
			);
			return result.rows;
		};

		const year2022Data = await fetchYearData(2022);
		const year2023Data = await fetchYearData(2023);
		const year2024Data = await fetchYearData(2024);

		console.log("2022 data count:", year2022Data.length);
		console.log("2023 data count:", year2023Data.length);
		console.log("2024 data count:", year2024Data.length);

		// If filtering by year and no data, return empty response
		if (yearParam && yearParam !== "all" &&
			year2022Data.length === 0 && year2023Data.length === 0 && year2024Data.length === 0) {
			console.log(`No data found for year ${yearParam}`);
			return NextResponse.json({
				success: false,
				error: `No data available for ${yearParam}`,
				data: null
			});
		}

		// Create a map for easy lookup of year data
		const year2023Map: Record<string, number> = {};
		year2023Data.forEach((item: any) => {
			year2023Map[item.saluran] = Number(item.value) || 0;
		});

		// Create a map for easy lookup of 2022 data
		const year2022Map: Record<string, number> = {};
		year2022Data.forEach((item: any) => {
			year2022Map[item.saluran] = Number(item.value) || 0;
		});

		// Create a map for 2024 data
		const year2024Map: Record<string, number> = {};
		year2024Data.forEach((item: any) => {
			year2024Map[item.saluran] = Number(item.value) || 0;
		});

		// Get all unique saluran names from all years
		const allSaluran = new Set<string>();
		year2022Data.forEach((item: any) => allSaluran.add(item.saluran));
		year2023Data.forEach((item: any) => allSaluran.add(item.saluran));
		year2024Data.forEach((item: any) => allSaluran.add(item.saluran));

		// Calculate percentage change and prepare metrics
		const saluranMetrics = Array.from(allSaluran).map((saluran) => {
			const year2022Value = year2022Map[saluran] || 0;
			const year2023Value = year2023Map[saluran] || 0;
			const year2024Value = year2024Map[saluran] || 0;

			let percentageChange = 0;
			let changeDirection = 'no change';

			// Calculate change from 2023 to 2024
			if (year2023Value > 0) {
				percentageChange = ((year2024Value - year2023Value) / year2023Value) * 100;
				changeDirection = percentageChange > 0 ? 'increase' : percentageChange < 0 ? 'decrease' : 'no change';
			} else if (year2024Value > 0) {
				percentageChange = 100; // New saluran
				changeDirection = 'new';
			}

			return {
				saluran: saluran,
				currentValue: year2024Value,
				previousValue: year2023Value,
				year2022Value: year2022Value,
				percentageChange: Math.abs(percentageChange),
				changeDirection: changeDirection,
				formattedChange: `${percentageChange > 0 ? "+" : ""
					}${percentageChange.toFixed(1)}%`,
				formattedCurrentValue: year2024Value.toLocaleString("en-MY", {
					style: "currency",
					currency: "MYR",
					minimumFractionDigits: 0,
					maximumFractionDigits: 0,
				}),
				formattedPreviousValue: year2023Value.toLocaleString("en-MY", {
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

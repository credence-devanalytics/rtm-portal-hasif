import { NextResponse } from "next/server";
import { db } from "@/index";
import { marketingChannelByyear } from "../../../../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function GET() {
	try {
		console.log("Marketing Forecasting API called");

		// Filter by the exact report title for Chart 1 data
		const reportTitle =
			"PERBANDINGAN PENDAPATAN TV, BES & RADIO BAGI TARIKH SEMASA (1 JANUARI – 31 DISEMBER)";

		// Fetch historical data for 2022-2024
		const historicalData = await db
			.select()
			.from(marketingChannelByyear)
			.where(
				and(
					eq(marketingChannelByyear.reportTitle, reportTitle),
					inArray(marketingChannelByyear.year, [2022, 2023, 2024])
				)
			)
			.orderBy(marketingChannelByyear.year);

		console.log("Historical data found:", historicalData.length, "records");

		// Process data by channels (TV, RADIO, BES)
		const channelMap = {};
		const years = [2022, 2023, 2024];

		historicalData.forEach((item) => {
			const channel = item.saluran;
			const year = item.year;
			const value = parseFloat(item.value) || 0;

			if (!channelMap[channel]) {
				channelMap[channel] = {};
			}
			channelMap[channel][year] = value;
		});

		// Generate forecast data for 2025 using linear projection
		const generateForecast = (channelData: { [key: number]: number }) => {
			const values = years.map((year) => channelData[year] || 0);

			// Simple linear projection based on trend
			const y2022 = values[0] || 0;
			const y2023 = values[1] || 0;
			const y2024 = values[2] || 0;

			// Calculate growth rates
			const growth2023to2024 = y2023 > 0 ? ((y2024 - y2023) / y2023) * 100 : 0;
			const growth2022to2023 = y2022 > 0 ? ((y2023 - y2022) / y2022) * 100 : 0;

			// Average growth rate for projection
			const avgGrowthRate = (growth2023to2024 + growth2022to2023) / 2;

			// Project 2025 with average growth
			const projected2025 = y2024 * (1 + avgGrowthRate / 100);

			// Calculate confidence intervals (±15% of projection)
			const confidenceInterval = {
				upper: projected2025 * 1.15,
				lower: projected2025 * 0.85,
			};

			return {
				historical: values,
				forecast: projected2025,
				confidenceInterval,
				growthRate: avgGrowthRate,
			};
		};

		// Process each channel
		const channels = ["TV", "RADIO", "BES"];
		const chartData = {
			channels: {},
			metadata: {
				reportTitle,
				historicalYears: years,
				forecastYear: 2025,
				currency: "MYR",
			},
		};

		channels.forEach((channel) => {
			if (channelMap[channel]) {
				chartData.channels[channel] = generateForecast(channelMap[channel]);
			}
		});

		// Calculate totals and summary
		const total2022 = channels.reduce(
			(sum, channel) => sum + (chartData.channels[channel]?.historical[0] || 0),
			0
		);
		const total2023 = channels.reduce(
			(sum, channel) => sum + (chartData.channels[channel]?.historical[1] || 0),
			0
		);
		const total2024 = channels.reduce(
			(sum, channel) => sum + (chartData.channels[channel]?.historical[2] || 0),
			0
		);
		const total2025 = channels.reduce(
			(sum, channel) => sum + (chartData.channels[channel]?.forecast || 0),
			0
		);

		const overallGrowthRate =
			total2023 > 0 ? ((total2024 - total2023) / total2023) * 100 : 0;

		const response = {
			success: true,
			data: {
				...chartData,
				summary: {
					totalRevenue: {
						2022: total2022,
						2023: total2023,
						2024: total2024,
						forecast2025: total2025,
					},
					overallGrowthRate,
					formattedRevenue: {
						2022: total2022.toLocaleString("en-MY", {
							style: "currency",
							currency: "MYR",
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						}),
						2023: total2023.toLocaleString("en-MY", {
							style: "currency",
							currency: "MYR",
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						}),
						2024: total2024.toLocaleString("en-MY", {
							style: "currency",
							currency: "MYR",
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						}),
						forecast2025: total2025.toLocaleString("en-MY", {
							style: "currency",
							currency: "MYR",
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						}),
					},
				},
			},
		};

		console.log("Marketing Forecasting API response prepared");
		return NextResponse.json(response);
	} catch (error) {
		console.error("Marketing Forecasting API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch marketing forecasting data",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

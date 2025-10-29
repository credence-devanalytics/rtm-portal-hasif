import { NextResponse } from "next/server";
import { db } from "@/index";
import { marketingChannelByyear } from "../../../../drizzle/schema";
import { eq, and, inArray, desc } from "drizzle-orm";

export async function GET(request: Request) {
	try {
		console.log("Top 10 Channels Forecasting API called");

		// Get category from query params
		const { searchParams } = new URL(request.url);
		const category = searchParams.get("category"); // "TV", "RADIO", "BES", or null for all

		// Get all report titles that contain channel data
		const reportTitles = [
			"PERBANDINGAN PENDAPATAN TV, BES & RADIO BAGI TARIKH SEMASA (1 JANUARI – 31 DISEMBER)",
			"PERBANDINGAN PENDAPATAN TV BAGI TARIKH SEMASA (1 JANUARI – 31 DISEMBER)",
			"PERBANDINGAN PENDAPATAN SALURAN RADIO BAGI TARIKH SEMASA (1 JANUARI – 31 DISEMBER)",
		];

		// Fetch all channel data for 2022-2024
		const allChannelData = await db
			.select({
				saluran: marketingChannelByyear.saluran,
				year: marketingChannelByyear.year,
				value: marketingChannelByyear.value,
			})
			.from(marketingChannelByyear)
			.where(
				and(
					inArray(marketingChannelByyear.reportTitle, reportTitles),
					inArray(marketingChannelByyear.year, [2022, 2023, 2024])
				)
			)
			.orderBy(marketingChannelByyear.year);

		console.log("Channel data found:", allChannelData.length, "records");

		// Process data by channels
		const channelMap: { [key: string]: { [key: number]: number } } = {};
		const years = [2022, 2023, 2024];

		allChannelData.forEach((item) => {
			const channel = item.saluran;
			const year = item.year;
			const value = parseFloat(item.value) || 0;

			if (!channelMap[channel]) {
				channelMap[channel] = {};
			}
			channelMap[channel][year] = value;
		});

		// Generate forecast data for each channel
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

			// Calculate confidence intervals (±20% for individual channels)
			const confidenceInterval = {
				upper: projected2025 * 1.2,
				lower: projected2025 * 0.8,
			};

			return {
				historical: values,
				forecast: projected2025,
				confidenceInterval,
				growthRate: avgGrowthRate,
			};
		};

		// Process all channels and categorize them
		const channelForecasts: Array<{
			channel: string;
			category: "TV" | "RADIO" | "BES";
			data: any;
		}> = [];

		Object.keys(channelMap).forEach((channel) => {
			const forecast = generateForecast(channelMap[channel]);
			let category: "TV" | "RADIO" | "BES";

			// Determine channel category
			if (channel.includes("TV") || channel === "TV") {
				category = "TV";
			} else if (channel.includes("fm") || channel.includes("RADIO")) {
				category = "RADIO";
			} else if (channel === "BES" || channel === "BESTV") {
				category = "BES";
			} else {
				category = "RADIO"; // Default to Radio
			}

			channelForecasts.push({
				channel,
				category,
				data: forecast,
			});
		});

		// Exclude main aggregators (TV, RADIO, BES) and only keep sub-channels
		const subChannels = channelForecasts.filter(
			(item) => !["TV", "RADIO", "BES"].includes(item.channel)
		);

		// Filter by category if specified
		const filteredChannels = category
			? subChannels.filter((item) => item.category === category)
			: subChannels;

		// Sort channels by maximum forecast range (upper confidence bound) and take top 10
		const top10Channels = filteredChannels
			.sort(
				(a, b) =>
					b.data.confidenceInterval.upper - a.data.confidenceInterval.upper
			)
			.slice(0, 10)
			.map((item, index) => ({
				rank: index + 1,
				channel: item.channel,
				category: item.category,
				currentRevenue: item.data.historical[2], // 2024 revenue
				forecastRevenue: item.data.forecast, // 2025 forecast
				growthRate: item.data.growthRate,
				confidenceInterval: item.data.confidenceInterval,
				historical: item.data.historical,
			}));

		// Calculate summary statistics - handle empty array case
		const totalTop3Revenue = top10Channels
			.slice(0, 3)
			.reduce((sum, ch) => sum + ch.currentRevenue, 0);
		const totalTop10Revenue = top10Channels.reduce(
			(sum, ch) => sum + ch.currentRevenue,
			0
		);
		const top3Concentration =
			top10Channels.length > 0
				? (totalTop3Revenue / totalTop10Revenue) * 100
				: 0;

		// Calculate all channels average for reference
		const totalAllChannelsRevenue = channelForecasts.reduce(
			(sum, ch) => sum + ch.data.historical[2],
			0
		);
		const averageAllChannelsRevenue =
			totalAllChannelsRevenue / channelForecasts.length;

		const response = {
			success: true,
			data: {
				channels: top10Channels,
				metadata: {
					reportTitle: "Top 10 Channel Revenue Forecast",
					historicalYears: years,
					forecastYear: 2025,
					currency: "MYR",
					totalChannels: channelForecasts.length,
				},
				summary: {
					totalTop10Revenue,
					top3Concentration,
					averageGrowthRate:
						top10Channels.length > 0
							? top10Channels.reduce((sum, ch) => sum + ch.growthRate, 0) /
							  top10Channels.length
							: 0,
					highestGrowthChannel:
						top10Channels.length > 0
							? top10Channels.reduce((max, ch) =>
									ch.growthRate > max.growthRate ? ch : max
							  )
							: null,
					// Add average for all channels
					averageAllChannelsRevenue,
					totalAllChannelsRevenue,
				},
			},
		};

		console.log("Top 10 Channels Forecasting API response prepared");
		return NextResponse.json(response);
	} catch (error) {
		console.error("Top 10 Channels Forecasting API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch top 10 channels forecasting data",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

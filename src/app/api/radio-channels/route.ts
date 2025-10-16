import { db } from "@/index";
import { eq } from "drizzle-orm";
import { marketingChannelByyear as marketingChannelByYear } from "../../../../drizzle/schema";

export async function GET() {
	try {
		console.log("Radio Channel Table API called");

		const radioChannelData = await db
			.select()
			.from(marketingChannelByYear)
			.where(eq(marketingChannelByYear.reportType, "Table 4"));

		console.log("Radio channel data count:", radioChannelData.length);

		// Group data by channel group (groupby column) and then by channel name
		const channelGroups = {};

		radioChannelData.forEach((row) => {
			const groupType = row.groupby;
			const channelName = row.saluran;
			const year = row.year;
			const value = parseFloat(row.value) || 0;

			if (!channelGroups[groupType]) {
				channelGroups[groupType] = {};
			}

			if (!channelGroups[groupType][channelName]) {
				channelGroups[groupType][channelName] = {
					channel: channelName,
					group: groupType,
				};
			}

			channelGroups[groupType][channelName][year] = value;
		});

		// Process each group and calculate totals and growth percentages
		const processedGroups = {};

		Object.keys(channelGroups).forEach((groupType) => {
			const channels = Object.values(channelGroups[groupType]);

			// Calculate growth percentages for each channel
			const channelsWithGrowth = channels.map((channel) => {
				const value2022 = channel[2022] || 0;
				const value2023 = channel[2023] || 0;
				const value2024 = channel[2024] || 0;

				// Calculate growth percentages
				const growth2022to2023 =
					value2022 > 0
						? (((value2023 - value2022) / value2022) * 100).toFixed(1)
						: "N/A";
				const growth2023to2024 =
					value2023 > 0
						? (((value2024 - value2023) / value2023) * 100).toFixed(1)
						: "N/A";

				return {
					...(channel as any),
					2022: value2022,
					2023: value2023,
					2024: value2024,
					growth2022to2023,
					growth2023to2024,
					totalValue: value2022 + value2023 + value2024,
				};
			});

			// Sort by total value (descending)
			channelsWithGrowth.sort((a, b) => b.totalValue - a.totalValue);

			// Calculate group totals
			const groupTotal2022 = channelsWithGrowth.reduce(
				(sum, ch) => sum + ch[2022],
				0
			);
			const groupTotal2023 = channelsWithGrowth.reduce(
				(sum, ch) => sum + ch[2023],
				0
			);
			const groupTotal2024 = channelsWithGrowth.reduce(
				(sum, ch) => sum + ch[2024],
				0
			);
			const groupTotalGrowth2022to2023 =
				groupTotal2022 > 0
					? (
							((groupTotal2023 - groupTotal2022) / groupTotal2022) *
							100
					  ).toFixed(1)
					: "N/A";
			const groupTotalGrowth2023to2024 =
				groupTotal2023 > 0
					? (
							((groupTotal2024 - groupTotal2023) / groupTotal2023) *
							100
					  ).toFixed(1)
					: "N/A";

			// Add Total row
			const totalRow = {
				channel: "TOTAL",
				group: groupType,
				2022: groupTotal2022,
				2023: groupTotal2023,
				2024: groupTotal2024,
				growth2022to2023: groupTotalGrowth2022to2023,
				growth2023to2024: groupTotalGrowth2023to2024,
				totalValue: groupTotal2022 + groupTotal2023 + groupTotal2024,
				isTotal: true,
			};

			processedGroups[groupType] = {
				groupName: groupType,
				channels: [...channelsWithGrowth, totalRow],
			};
		});

		console.log("Radio processed groups:", Object.keys(processedGroups));

		return Response.json({
			success: true,
			data: processedGroups,
		});
	} catch (error) {
		console.error("Radio Channel Table API error:", error);
		return Response.json(
			{
				success: false,
				error: "Failed to fetch radio channel data",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

import { NextResponse } from "next/server";
import { db } from "@/index";
import { pberitaAudienceGender } from "../../../../drizzle/schema";
import { sql } from "drizzle-orm";

export async function GET(request) {
	try {
		console.log("PB Gender Distribution API called");

		// Get view type from query parameters
		const { searchParams } = new URL(request.url);
		const viewType = searchParams.get("view");

		if (viewType === "hourly" || viewType === "hourly-pm") {
			// Fetch hourly gender distribution
			const hourlyGenderData = await db
				.select({
					hour: pberitaAudienceGender.hour,
					usergender: pberitaAudienceGender.usergender,
					totalActiveUsers: sql`SUM(${pberitaAudienceGender.activeusers})`.as(
						"totalActiveUsers"
					),
					totalNewUsers: sql`SUM(${pberitaAudienceGender.newusers})`.as(
						"totalNewUsers"
					),
				})
				.from(pberitaAudienceGender)
				.where(
					sql`${pberitaAudienceGender.hour} IS NOT NULL AND ${pberitaAudienceGender.hour} != ''`
				)
				.groupBy(pberitaAudienceGender.hour, pberitaAudienceGender.usergender)
				.orderBy(pberitaAudienceGender.hour);

			console.log("Hourly gender data from DB:", hourlyGenderData);

			// Create chart data based on view type
			const chartData = [];
			const isAM = viewType === "hourly";
			const startHour = isAM ? 0 : 12;
			const endHour = isAM ? 11 : 23;

			for (let hour = startHour; hour <= endHour; hour++) {
				const hourHHMM = (hour * 100).toString().padStart(4, "0");
				let hourLabel;

				if (isAM) {
					hourLabel = hour === 0 ? "12 AM" : `${hour} AM`;
				} else {
					hourLabel = hour === 12 ? "12 PM" : `${hour - 12} PM`;
				}

				const femaleData = hourlyGenderData.find(
					(item) => item.hour === hourHHMM && item.usergender === "female"
				);
				const maleData = hourlyGenderData.find(
					(item) => item.hour === hourHHMM && item.usergender === "male"
				);

				chartData.push({
					time: hourLabel,
					hour: hourHHMM,
					female: femaleData ? parseInt(femaleData.totalActiveUsers) : 0,
					male: maleData ? parseInt(maleData.totalActiveUsers) : 0,
				});
			}

			return NextResponse.json({
				success: true,
				data: {
					chartData,
					viewType,
				},
			});
		}

		// Overall gender distribution
		const genderData = await db
			.select({
				usergender: pberitaAudienceGender.usergender,
				totalActiveUsers: sql`SUM(${pberitaAudienceGender.activeusers})`.as(
					"totalActiveUsers"
				),
				totalNewUsers: sql`SUM(${pberitaAudienceGender.newusers})`.as(
					"totalNewUsers"
				),
				recordCount: sql`COUNT(*)`.as("recordCount"),
			})
			.from(pberitaAudienceGender)
			.groupBy(pberitaAudienceGender.usergender);

		const chartData = genderData.map((item) => ({
			gender: item.usergender,
			activeUsers: parseInt(item.totalActiveUsers) || 0,
			newUsers: parseInt(item.totalNewUsers) || 0,
			recordCount: parseInt(item.recordCount) || 0,
			percentage: 0,
		}));

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

		chartData.sort((a, b) => {
			const genderOrder = { female: 1, male: 2 };
			return (genderOrder[a.gender] || 999) - (genderOrder[b.gender] || 999);
		});

		const dominantGender = chartData.reduce(
			(max, item) => (item.activeUsers > max.activeusers ? item : max),
			chartData[0] || {}
		);

		return NextResponse.json({
			success: true,
			data: {
				chartData,
				summary: {
					totalUsers,
					totalNewUsers: chartData.reduce(
						(sum, item) => sum + item.newusers,
						0
					),
					dominantGender: dominantGender.gender || "N/A",
					dominantPercentage: dominantGender.percentage || 0,
					genderRatio:
						chartData.length >= 2
							? {
									female:
										chartData.find((item) => item.gender === "female")
											?.percentage || 0,
									male:
										chartData.find((item) => item.gender === "male")
											?.percentage || 0,
							  }
							: null,
				},
			},
		});
	} catch (error) {
		console.error("PB Gender Distribution API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch PB gender distribution data",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

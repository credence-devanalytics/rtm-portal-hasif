import { db } from "@/index";
import { pberitaAudienceGender, pberitaAudienceAge } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export interface PortalBeritaFilters {
	gender?: string | null;
	ageRange?: string | null;
	dayFilter?: string | null;
	hourFilter?: string | null;
}

export interface PortalBeritaAnalysisResult {
	targetDemographic: string;
	recommendations: {
		bestTimes: Array<{
			day: string;
			hour: string;
			date: string;
			score: number;
			activeUsers: number;
			newUsers: number;
		}>;
		peakDays: Array<{
			day: string;
			score: number;
		}>;
		peakHours: Array<{
			hour: string;
			score: number;
		}>;
	};
	insights: {
		totalActiveUsers: number;
		totalNewUsers: number;
		totalDataPoints: number;
		peakEngagement: string;
		trend: string;
		avgEngagementPerSlot: number;
	};
	filters: PortalBeritaFilters;
}

// Analysis function for advertisement recommendations
export function generatePortalBeritaAdvertisementAnalysis(
	data: any[],
	filters: PortalBeritaFilters
): PortalBeritaAnalysisResult {
	if (!data || data.length === 0) {
		return {
			targetDemographic: "No data available",
			recommendations: {
				bestTimes: [],
				peakDays: [],
				peakHours: [],
			},
			insights: {
				totalActiveUsers: 0,
				totalNewUsers: 0,
				totalDataPoints: 0,
				peakEngagement: "No data",
				trend: "Insufficient data",
				avgEngagementPerSlot: 0,
			},
			filters,
		};
	}

	// Calculate engagement scores for each time slot
	const timeSlotAnalysis = data.map((record) => {
		// Get target demographic data
		const targetGender = record.genderData.find((g) =>
			filters.gender
				? g.gender.toLowerCase() === filters.gender.toLowerCase()
				: g.gender
		);

		const ageBrackets = filters.ageRange
			? filters.ageRange.split(",").map((age) => age.trim())
			: ["18-24", "25-34", "35-44", "45-54", "55-64"]; // Default to all age brackets

		const targetAgeData = record.ageData.filter((a) =>
			ageBrackets.includes(a.ageBracket)
		);

		// Calculate total metrics for target demographic
		const totalActiveUsers =
			(targetGender?.activeUsers || 0) +
			targetAgeData.reduce((sum, age) => sum + age.activeUsers, 0);
		const totalNewUsers =
			(targetGender?.newUsers || 0) +
			targetAgeData.reduce((sum, age) => sum + age.newUsers, 0);

		// Calculate engagement score (weighted: active users * 1 + new users * 2)
		const engagementScore = totalActiveUsers + totalNewUsers * 2;

		return {
			date: record.date,
			hour: record.hour,
			dayName: record.dayName,
			totalActiveUsers,
			totalNewUsers,
			engagementScore,
			genderData: targetGender,
			ageData: targetAgeData,
		};
	});

	// Sort by engagement score (descending)
	timeSlotAnalysis.sort((a, b) => b.engagementScore - a.engagementScore);

	// Get top recommendations
	const topTimeSlots = timeSlotAnalysis.slice(0, 10);
	const bestTimes = topTimeSlots.map((slot) => ({
		day: slot.dayName,
		hour: slot.hour,
		date: slot.date,
		score: slot.engagementScore,
		activeUsers: slot.totalActiveUsers,
		newUsers: slot.totalNewUsers,
	}));

	// Analyze peak days
	const dayAnalysis: any = {};
	timeSlotAnalysis.forEach((slot) => {
		if (!dayAnalysis[slot.dayName]) {
			dayAnalysis[slot.dayName] = {
				totalEngagement: 0,
				totalActiveUsers: 0,
				totalNewUsers: 0,
				slotCount: 0,
			};
		}
		dayAnalysis[slot.dayName].totalEngagement += slot.engagementScore;
		dayAnalysis[slot.dayName].totalActiveUsers += slot.totalActiveUsers;
		dayAnalysis[slot.dayName].totalNewUsers += slot.totalNewUsers;
		dayAnalysis[slot.dayName].slotCount++;
	});

	const peakDays = Object.entries(dayAnalysis)
		.map(([day, data]: [string, any]) => ({
			day,
			avgEngagement: data.totalEngagement / data.slotCount,
			totalActiveUsers: data.totalActiveUsers,
			totalNewUsers: data.totalNewUsers,
		}))
		.sort((a, b) => b.avgEngagement - a.avgEngagement)
		.slice(0, 7);

	// Analyze peak hours
	const hourAnalysis: any = {};
	timeSlotAnalysis.forEach((slot) => {
		if (!hourAnalysis[slot.hour]) {
			hourAnalysis[slot.hour] = {
				totalEngagement: 0,
				totalActiveUsers: 0,
				totalNewUsers: 0,
				slotCount: 0,
			};
		}
		hourAnalysis[slot.hour].totalEngagement += slot.engagementScore;
		hourAnalysis[slot.hour].totalActiveUsers += slot.totalActiveUsers;
		hourAnalysis[slot.hour].totalNewUsers += slot.totalNewUsers;
		hourAnalysis[slot.hour].slotCount++;
	});

	const peakHours = Object.entries(hourAnalysis)
		.map(([hour, data]: [string, any]) => ({
			hour,
			avgEngagement: data.totalEngagement / data.slotCount,
			totalActiveUsers: data.totalActiveUsers,
			totalNewUsers: data.totalNewUsers,
		}))
		.sort((a, b) => b.avgEngagement - a.avgEngagement)
		.slice(0, 10);

	// Generate insights
	const totalActiveUsers = timeSlotAnalysis.reduce(
		(sum, slot) => sum + slot.totalActiveUsers,
		0
	);
	const totalNewUsers = timeSlotAnalysis.reduce(
		(sum, slot) => sum + slot.totalNewUsers,
		0
	);
	const peakEngagement = topTimeSlots[0]
		? `${topTimeSlots[0].dayName} ${topTimeSlots[0].hour}`
		: "No data";

	// Identify trends
	let trend = "No clear pattern detected";
	if (peakDays.length >= 2) {
		const topDay = peakDays[0].day;
		const isWeekday = [
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
		].includes(topDay);
		const isWeekend = ["Saturday", "Sunday"].includes(topDay);

		if (isWeekday) {
			trend = `Higher engagement on weekdays, particularly ${topDay}`;
		} else if (isWeekend) {
			trend = `Higher engagement on weekends, particularly ${topDay}`;
		}
	}

	const targetDemo = [];
	if (filters.gender) targetDemo.push(filters.gender);
	if (filters.ageRange) targetDemo.push(filters.ageRange);

	return {
		targetDemographic:
			targetDemo.length > 0 ? targetDemo.join(", ") : "All demographics",
		recommendations: {
			bestTimes,
			peakDays: peakDays.map((d) => ({ day: d.day, score: d.avgEngagement })),
			peakHours: peakHours.map((h) => ({
				hour: h.hour,
				score: h.avgEngagement,
			})),
		},
		insights: {
			totalActiveUsers,
			totalNewUsers,
			totalDataPoints: timeSlotAnalysis.length,
			peakEngagement,
			trend,
			avgEngagementPerSlot:
				(totalActiveUsers + totalNewUsers * 2) / timeSlotAnalysis.length,
		},
		filters,
	};
}

export async function fetchPortalBeritaAudienceData(
	filters: PortalBeritaFilters & { analysis?: boolean }
) {
	try {
		console.log("Fetching Portal Berita audience data with filters:", filters);

		// Perform the join query using Drizzle ORM
		const joinedData = await db
			.select({
				// Common fields
				date: pberitaAudienceGender.date,
				hour: pberitaAudienceGender.hour,

				// Gender fields
				userGender: pberitaAudienceGender.usergender,
				activeUsersGender: pberitaAudienceGender.activeusers,
				newUsersGender: pberitaAudienceGender.newusers,

				// Age fields
				userAgeBracket: pberitaAudienceAge.useragebracket,
				activeUsersAge: pberitaAudienceAge.activeusers,
				newUsersAge: pberitaAudienceAge.newusers,
			})
			.from(pberitaAudienceGender)
			.innerJoin(
				pberitaAudienceAge,
				and(
					eq(pberitaAudienceGender.date, pberitaAudienceAge.date),
					eq(pberitaAudienceGender.hour, pberitaAudienceAge.hour)
				)
			)
			.orderBy(
				pberitaAudienceGender.date,
				pberitaAudienceGender.hour,
				pberitaAudienceGender.usergender,
				pberitaAudienceAge.useragebracket
			)
			.limit(1000); // Limit to prevent excessive data

		console.log(`Retrieved ${joinedData.length} joined records`);

		// Helper function to get day name from date
		const getDayName = (dateString: string) => {
			const days = [
				"Sunday",
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday",
			];
			const date = new Date(dateString);
			return days[date.getDay()];
		};

		// Group data by date and hour for better structure
		const groupedData = joinedData.reduce((acc: any, row) => {
			const key = `${row.date}_${row.hour}`;

			if (!acc[key]) {
				acc[key] = {
					date: row.date,
					hour: row.hour,
					dayName: getDayName(row.date),
					genderData: [],
					ageData: [],
					combinations: [],
				};
			}

			// Add gender data if not already added
			if (!acc[key].genderData.find((g: any) => g.gender === row.userGender)) {
				acc[key].genderData.push({
					gender: row.userGender,
					activeUsers: row.activeUsersGender,
					newUsers: row.newUsersGender,
				});
			}

			// Add age data if not already added
			if (
				!acc[key].ageData.find((a: any) => a.ageBracket === row.userAgeBracket)
			) {
				acc[key].ageData.push({
					ageBracket: row.userAgeBracket,
					activeUsers: row.activeUsersAge,
					newUsers: row.newUsersAge,
				});
			}

			// Add the specific combination
			acc[key].combinations.push({
				gender: row.userGender,
				ageBracket: row.userAgeBracket,
				genderActiveUsers: row.activeUsersGender,
				genderNewUsers: row.newUsersGender,
				ageActiveUsers: row.activeUsersAge,
				ageNewUsers: row.newUsersAge,
			});

			return acc;
		}, {});

		const result = Object.values(groupedData);

		// Debug: Log sample data structure to understand what we're working with
		if (result.length > 0) {
			console.log('Sample grouped record:', JSON.stringify(result[0], null, 2));
			console.log('Available genders:', [...new Set(result.flatMap((r: any) => r.genderData.map((g: any) => g.gender)))]);
			console.log('Available age brackets:', [...new Set(result.flatMap((r: any) => r.ageData.map((a: any) => a.ageBracket)))]);
		}

		// Apply filters if provided
		let filteredData = result;
		if (
			filters.gender ||
			filters.ageRange ||
			filters.dayFilter ||
			filters.hourFilter
		) {
			filteredData = result.filter((record: any) => {
				// Gender filter - be more flexible to handle data variations
				if (filters.gender && filters.gender !== 'all') {
					const genderMatch = record.genderData.some(
						(g: any) => g.gender.toLowerCase() === filters.gender!.toLowerCase()
					);
					if (!genderMatch) {
						console.log(`Gender filter mismatch. Looking for: ${filters.gender}, available:`, record.genderData.map((g: any) => g.gender));
						return false;
					}
				}

				// Age range filter (comma-separated) - be more flexible
				if (filters.ageRange && filters.ageRange !== 'all') {
					const ageBrackets = filters.ageRange
						.split(",")
						.map((age) => age.trim());
					const ageMatch = record.ageData.some((a: any) =>
						ageBrackets.includes(a.ageBracket)
					);
					if (!ageMatch) {
						console.log(`Age filter mismatch. Looking for: ${filters.ageRange}, available:`, record.ageData.map((a: any) => a.ageBracket));
						return false;
					}
				}

				// Day filter
				if (filters.dayFilter) {
					if (filters.dayFilter.toLowerCase() === "weekdays") {
						const weekdays = [
							"Monday",
							"Tuesday",
							"Wednesday",
							"Thursday",
							"Friday",
						];
						if (!weekdays.includes(record.dayName)) return false;
					} else if (filters.dayFilter.toLowerCase() === "weekends") {
						const weekends = ["Saturday", "Sunday"];
						if (!weekends.includes(record.dayName)) return false;
					} else {
						// Specific day name
						if (
							record.dayName.toLowerCase() !== filters.dayFilter!.toLowerCase()
						)
							return false;
					}
				}

				// Hour filter (range or specific hour)
				if (filters.hourFilter) {
					if (filters.hourFilter.includes("-")) {
						// Time range like "09:00-17:00"
						const [start, end] = filters.hourFilter.split("-");
						const recordHour = parseInt(record.hour);
						const startHour = parseInt(start.replace(":", ""));
						const endHour = parseInt(end.replace(":", ""));
						if (recordHour < startHour || recordHour > endHour) return false;
					} else {
						// Specific hour
						if (record.hour !== filters.hourFilter) return false;
					}
				}

				return true;
			});

			// If no data matches the specific demographic filters, fall back to all data
			if (filteredData.length === 0 && (filters.gender || filters.ageRange)) {
				console.log('No data matches specific demographic filters. Falling back to all available data.');
				filteredData = result;
			}
		}

		// If analysis mode, generate recommendations
		if (filters.analysis) {
			const analysisResult = generatePortalBeritaAdvertisementAnalysis(
				filteredData,
				filters
			);

			return {
				success: true,
				analysis: analysisResult,
				rawData: {
					joinedData: filteredData,
					totalCount: filteredData.length,
					recordCount: joinedData.length,
					filters: filters,
				},
			};
		}

		return {
			success: true,
			data: {
				joinedData: filteredData,
				totalCount: filteredData.length,
				recordCount: joinedData.length,
				filters: filters,
				sampleRawData: joinedData.slice(0, 5), // Show first 5 raw records for reference
			},
		};
	} catch (error: any) {
		console.error("Portal Berita audience data fetch error:", error);
		return {
			success: false,
			error: "Failed to fetch joined audience data",
			details: error.message,
		};
	}
}

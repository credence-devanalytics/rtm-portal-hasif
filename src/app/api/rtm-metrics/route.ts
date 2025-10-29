import { db } from "@/index";
import { mentionsClassify } from "@/lib/schema";
import { and, sql, count, sum } from "drizzle-orm";
import { NextResponse } from "next/server";
import { buildWhereConditions } from "@/lib/cache";

export async function GET(request: Request) {
	try {
	const { searchParams } = new URL(request.url);
	
	// Extract filter parameters
	const filters = {
		fromDate: searchParams.get("from") || "",
		toDate: searchParams.get("to") || "",
		platform: searchParams.get("platform") || "",
		channel: searchParams.get("channel") || "",
		unit: searchParams.get("unit") || "",
	};

	console.log("📊 RTM Metrics API called with filters:", filters);

	// Build where conditions based on filters
	const whereConditions = buildWhereConditions(filters, mentionsClassify);
	
	// Run all 4 metrics queries in parallel
		const [
			[totalMentionsResult],
			[totalEngagementsResult],
			[totalReachResult],
			channelsByUnitResult,
		] = await Promise.all([
			// 1. Total Mentions
			db
				.select({
					total_mentions: count(),
				})
				.from(mentionsClassify)
				.where(and(...whereConditions)),

			// 2. Total Engagements
			db
				.select({
					total_engagements: sql`SUM(
						CASE 
							WHEN ${mentionsClassify.interaction} IS NOT NULL AND ${mentionsClassify.interaction} > 0 
							THEN ${mentionsClassify.interaction}
							ELSE COALESCE(${mentionsClassify.likecount}, 0) + COALESCE(${mentionsClassify.commentcount}, 0) + COALESCE(${mentionsClassify.sharecount}, 0)
						END
					)`,
				})
				.from(mentionsClassify)
				.where(and(...whereConditions)),

			// 3. Total Reach
			db
				.select({
					total_reach: sql`SUM(COALESCE(${mentionsClassify.reach}, 0))`,
				})
				.from(mentionsClassify)
				.where(and(...whereConditions)),

			// 4. Total Channels by Unit
			db
				.select({
					unit: mentionsClassify.groupname,
					total_channels: sql`COUNT(DISTINCT ${mentionsClassify.channel})`,
				})
				.from(mentionsClassify)
				.where(and(...whereConditions))
				.groupBy(mentionsClassify.groupname),
		]);

		const response = {
			totalMentions: Number(totalMentionsResult.total_mentions) || 0,
			totalEngagements: Number(totalEngagementsResult.total_engagements) || 0,
			totalReach: Number(totalReachResult.total_reach) || 0,
			channelsByUnit: channelsByUnitResult.map((c) => ({
				unit: c.unit,
				totalChannels: Number(c.total_channels) || 0,
			})),
			meta: {
				queryDate: new Date().toISOString(),
				filters,
			},
		};

		console.log("✅ RTM Metrics response:", response);

		return NextResponse.json(response);
	} catch (error) {
		console.error("❌ RTM Metrics API error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch RTM metrics", details: error.message },
			{ status: 500 }
		);
	}
}

// Enhanced API for dashboard data with caching

import { db } from "../../../index";
import { mentionsClassify } from "@/lib/schema";
import { desc, gte, and, sql, count, sum, avg } from "drizzle-orm";
import { NextResponse } from "next/server";
import cacheManager, {
	createFiltersFromParams,
	buildWhereConditions,
} from "@/lib/cache";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const filters = createFiltersFromParams(searchParams);

		// Use cached query for comprehensive dashboard data
		const result = await cacheManager.cachedQuery(
			"dashboard_comprehensive",
			filters,
			async () => {
				const whereConditions = buildWhereConditions(filters, mentionsClassify);

				// Run all database queries concurrently for better performance
				const [
					mentions,
					[metrics],
					sentimentBreakdown,
					platformDistribution,
					platformByUnitDistribution,
					dailyTrends,
					topMentions,
					influencerMentions,
					channelGroupBreakdown,
					unitBreakdown,
					channelBreakdown,
					authorBreakdown,
					dailyChannelBreakdown,
				] = await Promise.all([
					// 1. Get limited raw mentions data (for tables)
					db
						.select()
						.from(mentionsClassify)
						.where(and(...whereConditions))
						.orderBy(desc(mentionsClassify.inserttime))
						.limit(parseInt(String(filters.limit)) || 20000),

					// 2. Get aggregated metrics
					db
						.select({
							totalMentions: count(),
							totalReach: sum(mentionsClassify.reach),
							totalInteractions: sql`SUM(COALESCE(${mentionsClassify.likecount}, 0) + COALESCE(${mentionsClassify.sharecount}, 0) + COALESCE(${mentionsClassify.commentcount}, 0) + COALESCE(${mentionsClassify.totalreactionscount}, 0))`,
							avgEngagement: avg(mentionsClassify.engagementrate),
						})
						.from(mentionsClassify)
						.where(and(...whereConditions)),

					// 3. Get sentiment breakdown
					db
						.select({
							sentiment: mentionsClassify.sentiment,
							count: count(),
						})
						.from(mentionsClassify)
						.where(and(...whereConditions))
						.groupBy(mentionsClassify.sentiment),

				// 4. Get platform distribution
				db
				.select({
					platform: mentionsClassify.type,
					count: count(),
					totalReach: sum(mentionsClassify.reach),
					totalInteractions: sql`SUM(COALESCE(${mentionsClassify.likecount}, 0) + COALESCE(${mentionsClassify.sharecount}, 0) + COALESCE(${mentionsClassify.commentcount}, 0) + COALESCE(${mentionsClassify.totalreactionscount}, 0))`,
					// Calculate engagement rate: (total interactions / total reach) * 100
					// Use NULLIF to avoid division by zero
					avgEngagement: sql`AVG(
						COALESCE(${mentionsClassify.engagementrate}, 
							(COALESCE(${mentionsClassify.likecount}, 0) + COALESCE(${mentionsClassify.sharecount}, 0) + COALESCE(${mentionsClassify.commentcount}, 0) + COALESCE(${mentionsClassify.totalreactionscount}, 0)) 
							/ NULLIF(COALESCE(${mentionsClassify.reach}, 1), 0) * 100
						)
					)`,
				})
					.from(mentionsClassify)
					.where(and(...whereConditions))
					.groupBy(mentionsClassify.type)
					.orderBy(desc(count())),					// 5. Get platform distribution by unit (TV, Radio, News, Official)
				db
					.select({
						unit: sql`CASE 
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%radio%' THEN 'Radio'
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%tv%' THEN 'TV'
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%berita%' OR LOWER(${mentionsClassify.groupname}) LIKE '%news%' THEN 'News'
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%official%' THEN 'Official'
							ELSE 'Other'
						END`.as('unit'),
					platform: mentionsClassify.type,
					count: count(),
					totalReach: sum(mentionsClassify.reach),
					totalInteractions: sql`SUM(COALESCE(${mentionsClassify.likecount}, 0) + COALESCE(${mentionsClassify.sharecount}, 0) + COALESCE(${mentionsClassify.commentcount}, 0) + COALESCE(${mentionsClassify.totalreactionscount}, 0))`,
					// Calculate engagement rate: (total interactions / total reach) * 100
					avgEngagement: sql`AVG(
						COALESCE(${mentionsClassify.engagementrate}, 
							(COALESCE(${mentionsClassify.likecount}, 0) + COALESCE(${mentionsClassify.sharecount}, 0) + COALESCE(${mentionsClassify.commentcount}, 0) + COALESCE(${mentionsClassify.totalreactionscount}, 0)) 
							/ NULLIF(COALESCE(${mentionsClassify.reach}, 1), 0) * 100
						)
					)`,
				})
					.from(mentionsClassify)
					.where(and(...whereConditions))
					.groupBy(
						sql`CASE 
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%radio%' THEN 'Radio'
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%tv%' THEN 'TV'
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%berita%' OR LOWER(${mentionsClassify.groupname}) LIKE '%news%' THEN 'News'
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%official%' THEN 'Official'
							ELSE 'Other'
						END`,
						mentionsClassify.type
					)
					.orderBy(desc(count())),					// 6. Get daily trends (mentions over time)
					db
						.select({
							date: sql`DATE(${mentionsClassify.inserttime})`.as("date"),
							count: count(),
							positive:
								sql`SUM(CASE WHEN LOWER(${mentionsClassify.sentiment}) = 'positive' THEN 1 ELSE 0 END)`.as(
									"positive"
								),
							negative:
								sql`SUM(CASE WHEN LOWER(${mentionsClassify.sentiment}) = 'negative' THEN 1 ELSE 0 END)`.as(
									"negative"
								),
							neutral:
								sql`SUM(CASE WHEN LOWER(${mentionsClassify.sentiment}) = 'neutral' THEN 1 ELSE 0 END)`.as(
									"neutral"
								),
							totalReach: sum(mentionsClassify.reach),
							totalInteractions: sql`SUM(COALESCE(${mentionsClassify.likecount}, 0) + COALESCE(${mentionsClassify.sharecount}, 0) + COALESCE(${mentionsClassify.commentcount}, 0) + COALESCE(${mentionsClassify.totalreactionscount}, 0))`,
						})
						.from(mentionsClassify)
						.where(and(...whereConditions))
						.groupBy(sql`DATE(${mentionsClassify.inserttime})`)
						.orderBy(sql`DATE(${mentionsClassify.inserttime})`),

					// 7. Get top mentions by reach
					db
						.select()
						.from(mentionsClassify)
						.where(and(...whereConditions))
						.orderBy(desc(mentionsClassify.reach))
						.limit(10),

					// 8. Get influencer mentions (high follower count)
					db
						.select({
							count: count(),
							totalReach: sum(mentionsClassify.reach),
						})
						.from(mentionsClassify)
						.where(
							and(
								...whereConditions,
								sql`COALESCE(${mentionsClassify.followerscount}, ${mentionsClassify.authorfollowercount}, 0) > 10000`
							)
						),

					// 9. Get channel group breakdown (for radio stations and other channels)
					db
						.select({
							groupname: mentionsClassify.groupname,
							channel: mentionsClassify.channel,
							channelgroup: mentionsClassify.channelgroup,
							count: count(),
							totalReach: sum(mentionsClassify.reach),
						})
						.from(mentionsClassify)
						.where(and(...whereConditions))
						.groupBy(
							mentionsClassify.groupname,
							mentionsClassify.channel,
							mentionsClassify.channelgroup
						)
						.orderBy(desc(count()))
						.limit(100),

					// 10. Get unit breakdown (Official, TV, News, Radio, Other)
					db
						.select({
							unit: sql`CASE 
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%radio%' THEN 'Radio'
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%tv%' THEN 'TV'
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%berita%' OR LOWER(${mentionsClassify.groupname}) LIKE '%news%' THEN 'News'
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%official%' THEN 'Official'
								ELSE 'Other'
							END`.as('unit'),
							count: count(),
							totalReach: sum(mentionsClassify.reach),
							totalInteractions: sql`SUM(COALESCE(${mentionsClassify.likecount}, 0) + COALESCE(${mentionsClassify.sharecount}, 0) + COALESCE(${mentionsClassify.commentcount}, 0) + COALESCE(${mentionsClassify.totalreactionscount}, 0))`,
						})
						.from(mentionsClassify)
						.where(and(...whereConditions))
						.groupBy(sql`CASE 
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%radio%' THEN 'Radio'
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%tv%' THEN 'TV'
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%berita%' OR LOWER(${mentionsClassify.groupname}) LIKE '%news%' THEN 'News'
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%official%' THEN 'Official'
							ELSE 'Other'
						END`),

					// 11. Get channel-level breakdown (for each channel within units)
					db
						.select({
							channel: mentionsClassify.channel,
							groupname: mentionsClassify.groupname,
							unit: sql`CASE 
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%radio%' THEN 'Radio'
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%tv%' THEN 'TV'
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%berita%' OR LOWER(${mentionsClassify.groupname}) LIKE '%news%' THEN 'News'
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%official%' THEN 'Official'
								ELSE 'Other'
							END`.as('unit'),
							count: count(),
							totalReach: sum(mentionsClassify.reach),
							totalInteractions: sql`SUM(COALESCE(${mentionsClassify.likecount}, 0) + COALESCE(${mentionsClassify.sharecount}, 0) + COALESCE(${mentionsClassify.commentcount}, 0) + COALESCE(${mentionsClassify.totalreactionscount}, 0))`,
						})
						.from(mentionsClassify)
						.where(and(...whereConditions))
						.groupBy(
							mentionsClassify.channel,
							mentionsClassify.groupname,
							sql`CASE 
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%radio%' THEN 'Radio'
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%tv%' THEN 'TV'
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%berita%' OR LOWER(${mentionsClassify.groupname}) LIKE '%news%' THEN 'News'
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%official%' THEN 'Official'
								ELSE 'Other'
							END`
						)
						.orderBy(desc(count())),

					// 12. Get channel breakdown (for Channel Posts chart)
					db
						.select({
							author: mentionsClassify.channel, // Use channel field instead of author
							unit: sql`CASE 
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%radio%' THEN 'Radio'
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%tv%' THEN 'TV'
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%berita%' OR LOWER(${mentionsClassify.groupname}) LIKE '%news%' THEN 'News'
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%official%' THEN 'Official'
								ELSE 'Other'
							END`.as('unit'),
							count: count(),
							totalReach: sum(mentionsClassify.reach),
							totalInteractions: sql`SUM(COALESCE(${mentionsClassify.likecount}, 0) + COALESCE(${mentionsClassify.sharecount}, 0) + COALESCE(${mentionsClassify.commentcount}, 0) + COALESCE(${mentionsClassify.totalreactionscount}, 0))`,
						})
						.from(mentionsClassify)
						.where(
							and(
								...whereConditions,
								sql`${mentionsClassify.channel} IS NOT NULL AND ${mentionsClassify.channel} != ''`
							)
						)
						.groupBy(
							mentionsClassify.channel,
							sql`CASE 
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%radio%' THEN 'Radio'
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%tv%' THEN 'TV'
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%berita%' OR LOWER(${mentionsClassify.groupname}) LIKE '%news%' THEN 'News'
								WHEN LOWER(${mentionsClassify.groupname}) LIKE '%official%' THEN 'Official'
								ELSE 'Other'
							END`
						)
					.orderBy(desc(count())),

				// 13. Get daily channel breakdown (for Channel Posts time series chart)
				db
					.select({
						date: sql`DATE(${mentionsClassify.inserttime})`.as("date"),
						channel: mentionsClassify.channel,
						platform: mentionsClassify.type,
						unit: sql`CASE 
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%radio%' THEN 'Radio'
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%tv%' THEN 'TV'
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%berita%' OR LOWER(${mentionsClassify.groupname}) LIKE '%news%' THEN 'News'
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%official%' THEN 'Official'
							ELSE 'Other'
						END`.as('unit'),
						count: count(),
						totalReach: sum(mentionsClassify.reach),
						totalInteractions: sql`SUM(COALESCE(${mentionsClassify.likecount}, 0) + COALESCE(${mentionsClassify.sharecount}, 0) + COALESCE(${mentionsClassify.commentcount}, 0) + COALESCE(${mentionsClassify.totalreactionscount}, 0))`,
					})
					.from(mentionsClassify)
					.where(
						and(
							...whereConditions,
							sql`${mentionsClassify.channel} IS NOT NULL AND ${mentionsClassify.channel} != ''`
						)
					)
					.groupBy(
						sql`DATE(${mentionsClassify.inserttime})`,
						mentionsClassify.channel,
						mentionsClassify.type,
						sql`CASE 
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%radio%' THEN 'Radio'
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%tv%' THEN 'TV'
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%berita%' OR LOWER(${mentionsClassify.groupname}) LIKE '%news%' THEN 'News'
							WHEN LOWER(${mentionsClassify.groupname}) LIKE '%official%' THEN 'Official'
							ELSE 'Other'
						END`
					)
					.orderBy(sql`DATE(${mentionsClassify.inserttime})`),
			]);			const response = {
				// Raw data for detailed analysis
				mentions: mentions.slice(
					0,
					parseInt(filters.limit) || 20000
				), // Use requested limit, default 20000

				// Aggregated metrics
					metrics: {
						totalMentions: Number(metrics.totalMentions) || 0,
						totalReach: Number(metrics.totalReach) || 0,
						totalInteractions: Number(metrics.totalInteractions) || 0,
						avgEngagement: Number(metrics.avgEngagement) || 0,
						influencerMentions: Number(influencerMentions[0]?.count) || 0,
					},

					// Sentiment data
					sentiment: {
						breakdown: sentimentBreakdown.map((s) => ({
							sentiment: s.sentiment || "unknown",
							count: Number(s.count) || 0,
						})),
						trend: dailyTrends.map((d) => ({
							date: d.date,
							positive: Number(d.positive) || 0,
							negative: Number(d.negative) || 0,
							neutral: Number(d.neutral) || 0,
						})),
					},

				// Platform data
				platforms: platformDistribution.map((p) => ({
					platform: p.platform,
					count: Number(p.count) || 0,
					totalReach: Number(p.totalReach) || 0,
					totalInteractions: Number(p.totalInteractions) || 0,
					avgEngagementRate: Number(p.avgEngagement) || 0,
				})),					// Platform distribution by unit (TV, Radio, News, Official)
				platformByUnit: platformByUnitDistribution.map((p) => ({
					unit: p.unit,
					platform: p.platform,
					count: Number(p.count) || 0,
					totalReach: Number(p.totalReach) || 0,
					totalInteractions: Number(p.totalInteractions) || 0,
					avgEngagementRate: Number(p.avgEngagement) || 0,
				})),					// Time series data
					timeSeries: dailyTrends.map((d) => ({
						date: d.date,
						mentions: Number(d.count) || 0,
						reach: Number(d.totalReach) || 0,
						interactions: Number(d.totalInteractions) || 0,
					})),

					// Channel group breakdown (includes new channelgroup field)
					channelGroups: channelGroupBreakdown.map((c) => ({
						groupname: c.groupname,
						channel: c.channel,
						channelgroup: c.channelgroup,
						count: Number(c.count) || 0,
						totalReach: Number(c.totalReach) || 0,
					})),

					// Unit breakdown with accurate database counts
					units: unitBreakdown.map((u) => ({
						unit: u.unit,
						count: Number(u.count) || 0,
						totalReach: Number(u.totalReach) || 0,
						totalInteractions: Number(u.totalInteractions) || 0,
					})),

					// Channel breakdown with accurate database counts (grouped by unit and channel)
					channels: channelBreakdown.map((c) => ({
						channel: c.channel,
						groupname: c.groupname,
						unit: c.unit,
						count: Number(c.count) || 0,
						totalReach: Number(c.totalReach) || 0,
						totalInteractions: Number(c.totalInteractions) || 0,
					})),

					// Author breakdown with accurate database counts (for Channel Posts chart)
					authorsData: authorBreakdown.map((a) => ({
						author: a.author,
						unit: a.unit, // Include unit from groupname CASE logic
						count: Number(a.count) || 0,
						totalReach: Number(a.totalReach) || 0,
						totalInteractions: Number(a.totalInteractions) || 0,
					})),

				// Daily channel breakdown (for Channel Posts time series chart)
				dailyChannelData: dailyChannelBreakdown.map((d) => ({
					date: d.date,
					channel: d.channel,
					platform: d.platform,
					unit: d.unit,
					count: Number(d.count) || 0,
					totalReach: Number(d.totalReach) || 0,
					totalInteractions: Number(d.totalInteractions) || 0,
				})),					// Top performing content
					topContent: topMentions,

					// Metadata
					meta: {
						queryDate: new Date().toISOString(),
						filters,
						cached: true,
						dataLimited: mentions.length >= (parseInt(filters.limit) || 50),
					},
				};

				return response;
			},
			300 // 5 minutes cache
		);

		console.log(
			`Dashboard API: Processed data with caching (${
				result._cache?.hit ? "HIT" : "MISS"
			})`
		);
		
		// DEBUG: Log dailyChannelData to see what we're getting
		console.log("🔍 Daily Channel Data Debug:", {
			filters,
			dailyChannelDataCount: result.dailyChannelData?.length || 0,
			sampleData: result.dailyChannelData?.slice(0, 3),
			uniqueUnits: [...new Set(result.dailyChannelData?.map(d => d.unit) || [])],
		});

		return NextResponse.json(result);
	} catch (error) {
		console.error("Dashboard API error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch dashboard data", details: error.message },
			{ status: 500 }
		);
	}
}

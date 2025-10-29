import { db } from "@/index";
import { mentionsClassify } from "@/lib/schema";
import { and, sql, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { buildWhereConditions } from "@/lib/cache";

/**
 * RTM Timeline API
 * 
 * Provides data for:
 * 1. OverallMentionsChart - Daily mentions count grouped by platform
 * 2. EngagementOverTimeChart - Daily engagement metrics (reach, interactions, engagement rate)
 * 3. ClassificationMentionsChart - Category/classification breakdown
 * 4. PopularMentionsTable - Top 10 mentions by reach
 * 
 * All queries use the same filters for consistency.
 */
export async function GET(request: Request) {
	const startTime = Date.now();
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

		console.log("📊 RTM Timeline API called with filters:", filters);

		// Build where conditions based on filters
		const whereConditions = buildWhereConditions(filters, mentionsClassify);
		
		// Run all 4 queries in parallel for performance
		const [
			dailyMentionsByPlatform,
			dailyEngagementMetrics,
			categoryBreakdown,
			topMentions,
		] = await Promise.all([
			// 1. Daily Mentions by Platform (for OverallMentionsChart)
			db
				.select({
					date: sql<string>`DATE(${mentionsClassify.insertdate})`,
					platform: sql<string>`
						CASE 
							WHEN LOWER(${mentionsClassify.type}) LIKE '%facebook%' THEN 'facebook'
							WHEN LOWER(${mentionsClassify.type}) LIKE '%instagram%' THEN 'instagram'
							WHEN LOWER(${mentionsClassify.type}) LIKE '%twitter%' THEN 'twitter'
							WHEN LOWER(${mentionsClassify.type}) LIKE '%tiktok%' THEN 'tiktok'
							WHEN LOWER(${mentionsClassify.type}) LIKE '%youtube%' THEN 'youtube'
							WHEN LOWER(${mentionsClassify.type}) LIKE '%reddit%' THEN 'reddit'
							WHEN LOWER(${mentionsClassify.type}) LIKE '%linkedin%' THEN 'linkedin'
							ELSE 'other'
						END
					`,
					count: sql<number>`COUNT(*)`,
				})
				.from(mentionsClassify)
				.where(and(...whereConditions))
				.groupBy(sql`DATE(${mentionsClassify.insertdate})`, sql`
					CASE 
						WHEN LOWER(${mentionsClassify.type}) LIKE '%facebook%' THEN 'facebook'
						WHEN LOWER(${mentionsClassify.type}) LIKE '%instagram%' THEN 'instagram'
						WHEN LOWER(${mentionsClassify.type}) LIKE '%twitter%' THEN 'twitter'
						WHEN LOWER(${mentionsClassify.type}) LIKE '%tiktok%' THEN 'tiktok'
						WHEN LOWER(${mentionsClassify.type}) LIKE '%youtube%' THEN 'youtube'
						WHEN LOWER(${mentionsClassify.type}) LIKE '%reddit%' THEN 'reddit'
						WHEN LOWER(${mentionsClassify.type}) LIKE '%linkedin%' THEN 'linkedin'
						ELSE 'other'
					END
				`)
				.orderBy(sql`DATE(${mentionsClassify.insertdate})`),

			// 2. Daily Engagement Metrics (for EngagementOverTimeChart)
			db
				.select({
					date: sql<string>`DATE(${mentionsClassify.insertdate})`,
					total_reach: sql<number>`
						SUM(
							COALESCE(NULLIF(${mentionsClassify.reach}, 0), 
							NULLIF(${mentionsClassify.viewcount}, 0),
							NULLIF(${mentionsClassify.followerscount}, 0),
							NULLIF(${mentionsClassify.sourcereach}, 0),
							0)
						)
					`,
					total_interactions: sql<number>`
						SUM(
							COALESCE(NULLIF(${mentionsClassify.interaction}, 0),
							NULLIF(${mentionsClassify.totalreactionscount}, 0),
							${mentionsClassify.likecount} + ${mentionsClassify.commentcount} + ${mentionsClassify.sharecount} + ${mentionsClassify.playcount} + ${mentionsClassify.replycount} + ${mentionsClassify.retweetcount},
							0)
						)
					`,
					posts_count: sql<number>`COUNT(*)`,
				})
				.from(mentionsClassify)
				.where(and(...whereConditions))
				.groupBy(sql`DATE(${mentionsClassify.insertdate})`)
				.orderBy(sql`DATE(${mentionsClassify.insertdate})`),

			// 3. Category/Classification Breakdown (for ClassificationMentionsChart)
			// Use topic field instead of category
			db
				.select({
					category: mentionsClassify.topic,
					count: sql<number>`COUNT(*)`,
				})
				.from(mentionsClassify)
				.where(and(...whereConditions, sql`${mentionsClassify.topic} IS NOT NULL AND ${mentionsClassify.topic} != ''`))
				.groupBy(mentionsClassify.topic)
				.orderBy(sql`COUNT(*) DESC`)
				.limit(50), // Top 50 categories

			// 4. Top Mentions by Reach (for PopularMentionsTable)
			db
				.select({
					id: mentionsClassify.id,
					channel: mentionsClassify.channel,
					title: mentionsClassify.title,
					mention: mentionsClassify.mention, // Use mention instead of content
					platform: mentionsClassify.type,
					topic: mentionsClassify.topic, // Use topic instead of category
					sentiment: mentionsClassify.sentiment,
					reach: sql<number>`
						COALESCE(NULLIF(${mentionsClassify.reach}, 0), 
						NULLIF(${mentionsClassify.viewcount}, 0),
						NULLIF(${mentionsClassify.followerscount}, 0),
						NULLIF(${mentionsClassify.sourcereach}, 0),
						0)
					`,
					interactions: sql<number>`
						COALESCE(NULLIF(${mentionsClassify.interaction}, 0),
						NULLIF(${mentionsClassify.totalreactionscount}, 0),
						${mentionsClassify.likecount} + ${mentionsClassify.commentcount} + ${mentionsClassify.sharecount},
						0)
					`,
					likecount: mentionsClassify.likecount,
					commentcount: mentionsClassify.commentcount,
					sharecount: mentionsClassify.sharecount,
					url: mentionsClassify.url,
					insertdate: mentionsClassify.insertdate,
					author: mentionsClassify.author, // Use author instead of source
					unit: mentionsClassify.groupname,
				})
				.from(mentionsClassify)
				.where(and(...whereConditions))
				.orderBy(desc(sql`
					COALESCE(NULLIF(${mentionsClassify.reach}, 0), 
					NULLIF(${mentionsClassify.viewcount}, 0),
					NULLIF(${mentionsClassify.followerscount}, 0),
					NULLIF(${mentionsClassify.sourcereach}, 0),
					0)
				`))
				.limit(10),
		]);

		console.log(`⏱️ Database queries completed in ${Date.now() - startTime}ms`);

		// Transform daily mentions by platform into the format expected by OverallMentionsChart
		// Expected format: [{ date: "2024-01-01", facebook: 10, instagram: 5, ... }]
		const mentionsOverTime = dailyMentionsByPlatform.reduce((acc, row) => {
			const dateStr = row.date;
			if (!acc[dateStr]) {
				acc[dateStr] = {
					date: dateStr,
					facebook: 0,
					instagram: 0,
					twitter: 0,
					tiktok: 0,
					youtube: 0,
					reddit: 0,
					linkedin: 0,
					other: 0,
				};
			}
			
			const platform = row.platform.toLowerCase();
			if (acc[dateStr][platform] !== undefined) {
				acc[dateStr][platform] = Number(row.count);
			}
			
			return acc;
		}, {});

		const mentionsOverTimeArray = Object.values(mentionsOverTime).sort(
			(a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
		);

		// Transform daily engagement metrics into the format expected by EngagementOverTimeChart
		// Expected format: [{ date: "2024-01-01", reach: 1000, posts: 10, interactions: 500, engagementRate: 50 }]
		const engagementOverTime = dailyEngagementMetrics.map((row) => {
			const reach = Number(row.total_reach) || 0;
			const interactions = Number(row.total_interactions) || 0;
			const posts = Number(row.posts_count) || 0;
			const engagementRate = reach > 0 ? (interactions / reach) * 100 : 0;

			return {
				date: row.date,
				reach,
				posts,
				interactions,
				engagementRate,
			};
		});

		// Transform category breakdown
		// Expected format: [{ category: "News", count: 100 }]
		const classificationData = categoryBreakdown
			.filter((row) => row.category && row.category.trim() !== "")
			.map((row) => ({
				category: row.category,
				count: Number(row.count),
			}));

		// Transform top mentions
		// Expected format: [{ id, channel, title, content, platform, category, sentiment, reach, interactions, ... }]
		const popularMentions = topMentions.map((row) => ({
			id: row.id,
			channel: row.channel,
			title: row.title,
			content: row.mention, // Map mention to content for compatibility
			platform: row.platform,
			category: row.topic, // Map topic to category for compatibility
			sentiment: row.sentiment,
			reach: Number(row.reach) || 0,
			interactions: Number(row.interactions) || 0,
			likecount: Number(row.likecount) || 0,
			commentcount: Number(row.commentcount) || 0,
			sharecount: Number(row.sharecount) || 0,
			url: row.url,
			date: row.insertdate,
			author: row.author,
			unit: row.unit,
		}));

		const response = {
			// Data for OverallMentionsChart
			mentionsOverTime: mentionsOverTimeArray,
			
			// Data for EngagementOverTimeChart
			engagementOverTime,
			
			// Data for ClassificationMentionsChart
			classificationData,
			
			// Data for PopularMentionsTable
			popularMentions,
			
			meta: {
				queryDate: new Date().toISOString(),
				filters,
				totalTime: `${Date.now() - startTime}ms`,
				counts: {
					mentionsOverTime: mentionsOverTimeArray.length,
					engagementOverTime: engagementOverTime.length,
					classifications: classificationData.length,
					topMentions: popularMentions.length,
				},
			},
		};

		console.log("✅ RTM Timeline API response:", {
			mentionsOverTime: response.mentionsOverTime.length,
			engagementOverTime: response.engagementOverTime.length,
			classifications: response.classificationData.length,
			topMentions: response.popularMentions.length,
			totalTime: response.meta.totalTime,
		});

		return NextResponse.json(response);
	} catch (error) {
		console.error("❌ RTM Timeline API error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch RTM timeline data", details: error.message },
			{ status: 500 }
		);
	}
}

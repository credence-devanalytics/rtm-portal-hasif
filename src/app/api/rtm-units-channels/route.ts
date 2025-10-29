import { db } from "@/index";
import { mentionsClassify } from "@/lib/schema";
import { and, sql, count } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * RTM Units & Channels API for Pie Chart
 * 
 * Provides two datasets:
 * 1. Inner circle: Units grouped by groupname with total mentions
 * 2. Outer circle: Channels grouped by groupname and channel with total mentions
 */
export async function GET(request: Request) {
	const startTime = Date.now();
	try {
		const { searchParams } = new URL(request.url);
		
		// Extract filter parameters
		const fromDate = searchParams.get("from") || "";
		const toDate = searchParams.get("to") || "";
		const platform = searchParams.get("platform") || "";
		const channel = searchParams.get("channel") || "";
		const unit = searchParams.get("unit") || "";

		console.log("📊 RTM Units & Channels API called with filters:", { fromDate, toDate, platform, channel, unit });

		// Build where conditions
		const whereConditions = [];
		
		// Date filtering using insertdate (NOW() - INTERVAL '30 days')
		if (fromDate && toDate) {
			whereConditions.push(sql`${mentionsClassify.insertdate} >= ${fromDate}::date`);
			whereConditions.push(sql`${mentionsClassify.insertdate} <= ${toDate}::date`);
		} else {
			// Default to last 30 days using PostgreSQL interval
			whereConditions.push(sql`${mentionsClassify.insertdate} >= NOW() - INTERVAL '30 days'`);
		}

		// Platform filtering (optional)
		if (platform && platform !== "" && platform !== "all") {
			whereConditions.push(
				sql`LOWER(${mentionsClassify.type}) LIKE ${`%${platform.toLowerCase()}%`}`
			);
		}

		// Channel filtering (optional) - use ILIKE for case-insensitive partial match
		if (channel && channel !== "" && channel !== "all") {
			whereConditions.push(
				sql`${mentionsClassify.channel} ILIKE ${`%${channel}%`}`
			);
		}

		// Unit filtering (optional) - filter by groupname
		// Use ILIKE for case-insensitive partial matching
		// Note: "berita" tab should match database values (no need to map to "news" anymore)
		if (unit && unit !== "" && unit !== "all") {
			whereConditions.push(
				sql`${mentionsClassify.groupname} ILIKE ${`%${unit}%`}`
			);
		}

		console.log(`⏱️ Building conditions took ${Date.now() - startTime}ms`);

		// Query 1: Inner circle - Units (groupname)
		// SQL: SELECT groupname AS name, COUNT(*) AS total_mentions
		//      FROM mentions_classify
		//      WHERE insertdate >= NOW() - INTERVAL '30 days'
		//      GROUP BY groupname
		//      ORDER BY total_mentions DESC;
		const unitsQueryStart = Date.now();
		const unitsResult = await db
			.select({
				name: mentionsClassify.groupname,
				total_mentions: count(),
			})
			.from(mentionsClassify)
			.where(and(...whereConditions))
			.groupBy(mentionsClassify.groupname);
		console.log(`⏱️ Units query took ${Date.now() - unitsQueryStart}ms`);

		// Sort by total_mentions descending
		const sortedUnits = unitsResult.sort((a, b) => Number(b.total_mentions) - Number(a.total_mentions));

		console.log("✅ Units data:", sortedUnits.length, "units");
		console.log("📊 Units:", sortedUnits.map(r => ({ name: r.name, mentions: r.total_mentions })));

		// Query 2: Outer circle - Channels within units
		// SQL: SELECT groupname, channel AS name, COUNT(*) AS total_mentions
		//      FROM mentions_classify
		//      WHERE insertdate >= NOW() - INTERVAL '30 days'
		//      GROUP BY groupname, channel
		//      ORDER BY groupname, total_mentions DESC;
		const channelsQueryStart = Date.now();
		const channelsResult = await db
			.select({
				groupname: mentionsClassify.groupname,
				name: mentionsClassify.channel,
				total_mentions: count(),
			})
			.from(mentionsClassify)
			.where(and(...whereConditions))
			.groupBy(mentionsClassify.groupname, mentionsClassify.channel);
		console.log(`⏱️ Channels query took ${Date.now() - channelsQueryStart}ms`);

		// Sort by groupname and total_mentions descending
		const sortedChannels = channelsResult.sort((a, b) => {
			// First sort by groupname
			if (a.groupname !== b.groupname) {
				return (a.groupname || "").localeCompare(b.groupname || "");
			}
			// Then by total_mentions descending
			return Number(b.total_mentions) - Number(a.total_mentions);
		});

		console.log("✅ Channels data:", sortedChannels.length, "channels");
		console.log("📊 Sample channels:", sortedChannels.slice(0, 10).map(r => ({ 
			groupname: r.groupname, 
			name: r.name, 
			mentions: r.total_mentions 
		})));

		// Calculate totals
		const grandTotalMentions = sortedUnits.reduce((sum, r) => sum + Number(r.total_mentions), 0);
		console.log("🔢 Grand Total Mentions:", grandTotalMentions);

		console.log(`⏱️ Total API time: ${Date.now() - startTime}ms`);

		return NextResponse.json({
			units: {
				data: sortedUnits.map((row) => ({
					name: row.name,
					totalPosts: Number(row.total_mentions) || 0,
				})),
				total: grandTotalMentions,
			},
			channels: {
				data: sortedChannels.map((row) => ({
					groupname: row.groupname,
					name: row.name,
					unit: row.groupname, // Alias for compatibility
					totalPosts: Number(row.total_mentions) || 0,
				})),
				total: channelsResult.reduce((sum, r) => sum + Number(r.total_mentions), 0),
			},
			meta: {
				queryDate: new Date().toISOString(),
				filters: { fromDate, toDate, platform, channel, unit },
			},
		});
	} catch (error) {
		console.error("❌ RTM Units & Channels API error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch RTM units and channels data", details: error.message },
			{ status: 500 }
		);
	}
}

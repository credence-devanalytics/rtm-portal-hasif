import { NextRequest, NextResponse } from "next/server";
import { db } from "@/index";
import { mentionsClassify } from "@/lib/schema";
import { and, sql, between } from "drizzle-orm";

/**
 * GET /api/rtm-account/engagement-by-platform
 * 
 * Calculates engagement rate by platform from mentions_classify table.
 * 
 * Query Parameters:
 * - startDate: Start date (YYYY-MM-DD)
 * - endDate: End date (YYYY-MM-DD)
 * - platform: Filter by specific platform (optional)
 * - type: Filter by type (optional, for cross-filtering)
 * - channel: Filter by author/channel (optional, for cross-filtering)
 * - unit: Filter by unit/groupname (optional, for cross-filtering)
 * 
 * Returns engagement rate percentage, total interactions, total reach, and mentions count per platform.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const platformFilter = searchParams.get("platform");
    const typeFilter = searchParams.get("type");
    const channelFilter = searchParams.get("channel");
    const unitFilter = searchParams.get("unit");

    console.log("[Engagement By Platform API] Request params:", {
      startDate,
      endDate,
      platformFilter,
      typeFilter,
      channelFilter,
      unitFilter,
    });

    // Build WHERE conditions
    const whereConditions = [];

    // Date range filter
    if (startDate && endDate) {
      whereConditions.push(
        between(mentionsClassify.insertdate, startDate, endDate)
      );
    }

    // Platform filter
    if (platformFilter) {
      whereConditions.push(sql`${mentionsClassify.type} = ${platformFilter}`);
    }

    // Type filter (for cross-filtering)
    if (typeFilter) {
      whereConditions.push(sql`${mentionsClassify.type} = ${typeFilter}`);
    }

    // Channel filter (for cross-filtering, case-insensitive, partial match)
    if (channelFilter) {
      // Use ILIKE for case-insensitive partial match on channel only
      whereConditions.push(sql`${mentionsClassify.channel} ILIKE ${`%${channelFilter}%`}`);
    }

    // Unit filter (for cross-filtering by unit/groupname)
    if (unitFilter && unitFilter !== "" && unitFilter !== "all" && unitFilter !== "overall") {
      // Map unit filter values to groupname patterns
      if (unitFilter === "official") {
        whereConditions.push(sql`${mentionsClassify.groupname} ILIKE '%Official%'`);
      } else if (unitFilter === "tv") {
        whereConditions.push(sql`${mentionsClassify.groupname} ILIKE '%TV%'`);
      } else if (unitFilter === "berita") {
        whereConditions.push(sql`${mentionsClassify.groupname} ILIKE '%BERITA%'`);
      } else if (unitFilter === "radio") {
        whereConditions.push(sql`${mentionsClassify.groupname} ILIKE '%Radio%'`);
      } else {
        // Generic unit filter - case-insensitive partial match
        whereConditions.push(sql`${mentionsClassify.groupname} ILIKE ${`%${unitFilter}%`}`);
      }
    }

    console.log("[Engagement By Platform API] Executing Drizzle query...");
    const queryStartTime = Date.now();

    // Execute the query using Drizzle ORM with the SQL logic from your working query
    // FIX: Filter out NaN values before casting to bigint to prevent "bigint out of range" error
    const result = await db.execute(sql`
      SELECT
        COALESCE(type, 'Unknown') AS platform,
        SUM(interactions)::numeric / NULLIF(SUM(reach_used), 0) * 100 AS engagement_rate_pct,
        SUM(interactions) AS total_interactions,
        SUM(reach_used) AS total_reach,
        COUNT(*) AS mentions_count
      FROM (
        SELECT
          -- choose reach: prefer reach, then viewcount, then followerscount, then sourcereach
          -- Filter out NaN values using CASE to prevent bigint cast errors
          CASE 
            WHEN COALESCE(NULLIF(reach, 0), NULLIF(viewcount, 0), NULLIF(followerscount, 0), NULLIF(sourcereach, 0)) = 'NaN'::double precision 
            THEN 0
            ELSE COALESCE(NULLIF(reach, 0), NULLIF(viewcount, 0), NULLIF(followerscount, 0), NULLIF(sourcereach, 0))
          END::bigint AS reach_used,

          -- choose interactions: prefer explicit interaction column, then totalreactionscount,
          -- otherwise sum of common engagement fields as a fallback
          -- Filter out NaN values in each field before summing
          COALESCE(
            CASE WHEN interaction = 'NaN'::double precision THEN NULL ELSE interaction END,
            CASE WHEN totalreactionscount = 'NaN'::double precision THEN NULL ELSE totalreactionscount END,
            (
              COALESCE(CASE WHEN likecount = 'NaN'::double precision THEN 0 ELSE likecount END, 0) + 
              COALESCE(CASE WHEN commentcount = 'NaN'::double precision THEN 0 ELSE commentcount END, 0) + 
              COALESCE(CASE WHEN sharecount = 'NaN'::double precision THEN 0 ELSE sharecount END, 0) +
              COALESCE(CASE WHEN playcount = 'NaN'::double precision THEN 0 ELSE playcount END, 0) + 
              COALESCE(CASE WHEN replycount = 'NaN'::double precision THEN 0 ELSE replycount END, 0) + 
              COALESCE(CASE WHEN retweetcount = 'NaN'::double precision THEN 0 ELSE retweetcount END, 0)
            )
          )::bigint AS interactions,

          type
        FROM ${mentionsClassify}
        ${whereConditions.length > 0 ? sql`WHERE ${sql.join(whereConditions, sql` AND `)}` : sql``}
      ) t
      GROUP BY COALESCE(type, 'Unknown')
      ORDER BY engagement_rate_pct DESC
    `);

    const queryTime = Date.now() - queryStartTime;
    console.log(`[Engagement By Platform API] Query executed in ${queryTime}ms`);
    console.log(
      `[Engagement By Platform API] Found ${result.rows.length} platforms`
    );
    console.log(`[Engagement By Platform API] Sample rows:`, result.rows.slice(0, 3));

    // Transform the data - Drizzle returns rows array
    const data = result.rows.map((row: any) => ({
      platform: row.platform || 'Unknown',
      engagement_rate_pct: parseFloat(row.engagement_rate_pct || '0') || 0,
      total_interactions: parseInt(row.total_interactions || '0') || 0,
      total_reach: parseInt(row.total_reach || '0') || 0,
      mentions_count: parseInt(row.mentions_count || '0') || 0,
    }));

    const totalTime = Date.now() - startTime;
    console.log(
      `[Engagement By Platform API] Total request time: ${totalTime}ms`
    );

    return NextResponse.json(
      {
        success: true,
        data,
        metadata: {
          total_platforms: data.length,
          query_time_ms: queryTime,
          total_time_ms: totalTime,
          filters: {
            startDate,
            endDate,
            platform: platformFilter,
            type: typeFilter,
            channel: channelFilter,
            unit: unitFilter,
          },
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("[Engagement By Platform API] Error:", error);

    // Log the full error stack for debugging
    if (error instanceof Error) {
      console.error("[Engagement By Platform API] Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch engagement rate by platform data",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

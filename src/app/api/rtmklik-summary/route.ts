/**
 * RTMKlik Summary API
 * Provides RTMKlik summary data for TV and Radio channels
 */

import { db } from '../../../index';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    console.log('RTMKlik Summary API called');

    // Query 1: Total Viewers for All TV and Radio Channels (MAU)
    const totalActiveUsersResult = await db.execute(sql`
      SELECT 
        (
          SELECT COALESCE(SUM(value), 0)
          FROM rtmklik_live_malaysia
          WHERE metric = 'activeUsers'
            AND DATE_TRUNC('month', date::date) = DATE_TRUNC('month', CURRENT_DATE)
        ) 
        + 
        (
          SELECT COALESCE(SUM(value), 0)
          FROM rtmklik_radio_malaysia
          WHERE metric = 'activeUsers'
            AND DATE_TRUNC('month', date::date) = DATE_TRUNC('month', CURRENT_DATE)
        ) AS total_active_users_rtmklik
    `);

    const totalActiveUsers = totalActiveUsersResult.rows[0]?.total_active_users_rtmklik || 0;
    console.log('Total Active Users:', totalActiveUsers);

    // Query 2: Top Region (TV+Radio MAU)
    const topRegionResult = await db.execute(sql`
      SELECT 
        location,
        SUM(total_active_users) AS combined_active_users
      FROM (
        -- TV data
        SELECT 
          location,
          SUM(value) AS total_active_users
        FROM rtmklik_live_malaysia
        WHERE metric = 'activeUsers'
          AND DATE_TRUNC('month', date::date) = DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY location

        UNION ALL

        -- Radio data
        SELECT 
          location,
          SUM(value) AS total_active_users
        FROM rtmklik_radio_malaysia
        WHERE metric = 'activeUsers'
          AND DATE_TRUNC('month', date::date) = DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY location
      ) AS combined
      GROUP BY location
      ORDER BY combined_active_users DESC
      LIMIT 1
    `);

    const topRegion = topRegionResult.rows[0] || { 
      location: 'No data', 
      combined_active_users: 0 
    };
    console.log('Top Region:', topRegion);

    // Query 3: Top Channel with MAU
    const topChannelResult = await db.execute(sql`
      SELECT 
        channel,
        SUM(value) AS total_active_users
      FROM rtmklik_popular_pages
      WHERE metric = 'activeUsers'
      GROUP BY channel
      ORDER BY total_active_users DESC
      LIMIT 1
    `);

    const topChannel = topChannelResult.rows[0] || { 
      channel: 'No data', 
      total_active_users: 0 
    };
    console.log('Top Channel:', topChannel);

    // Query 4: Total page views (Screen/Page Views)
    const totalPageViewsResult = await db.execute(sql`
      SELECT 
        (
          SELECT COALESCE(SUM(value), 0)
          FROM rtmklik_live_malaysia
          WHERE metric = 'screenPageViews'
            AND DATE_TRUNC('month', date::date) = DATE_TRUNC('month', CURRENT_DATE)
        ) 
        + 
        (
          SELECT COALESCE(SUM(value), 0)
          FROM rtmklik_radio_malaysia
          WHERE metric = 'screenPageViews'
            AND DATE_TRUNC('month', date::date) = DATE_TRUNC('month', CURRENT_DATE)
        ) AS total_screen_page_views_rtmklik
    `);

    const totalPageViews = totalPageViewsResult.rows[0]?.total_screen_page_views_rtmklik || 0;
    console.log('Total Page Views:', totalPageViews);

    // Get latest date from the data
    const latestDateResult = await db.execute(sql`
      SELECT MAX(date) as max_date
      FROM (
        SELECT MAX(date) as date FROM rtmklik_live_malaysia
        UNION ALL
        SELECT MAX(date) as date FROM rtmklik_radio_malaysia
      ) combined
    `);

    const latestDate = latestDateResult.rows[0]?.max_date || null;
    console.log('Latest Date:', latestDate);

    const response = {
      success: true,
      data: {
        totalActiveUsers: Number(totalActiveUsers),
        formattedTotalActiveUsers: Number(totalActiveUsers).toLocaleString(),
        topRegion: {
          name: topRegion.location,
          users: Number(topRegion.combined_active_users),
          formattedUsers: Number(topRegion.combined_active_users).toLocaleString(),
        },
        topChannel: {
          name: topChannel.channel,
          users: Number(topChannel.total_active_users),
          formattedUsers: Number(topChannel.total_active_users).toLocaleString(),
        },
        totalPageViews: Number(totalPageViews),
        formattedTotalPageViews: Number(totalPageViews).toLocaleString(),
        latestDate: latestDate,
        hasData: totalActiveUsers > 0 || totalPageViews > 0,
      },
      meta: {
        queryType: 'rtmklik_summary',
        timestamp: new Date().toISOString(),
        note: 'Data aggregated from rtmklik_live_malaysia, rtmklik_radio_malaysia, and rtmklik_popular_pages tables'
      }
    };

    console.log('RTMKlik Summary API response:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('RTMKlik Summary API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch RTMKlik summary data', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

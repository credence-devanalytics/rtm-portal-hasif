// app/api/dashboard/route.js - Enhanced API for dashboard data

import { db } from '../../../index';
import { mentionsClassify } from '@/lib/schema';
import { desc, gte, and, sql, count, sum, avg } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const platform = searchParams.get('platform');
    const unit = searchParams.get('unit');
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    
    // Calculate date filter
    let cutoffDate, endDate;
    
    if (fromDate && toDate) {
      // Use explicit date range if provided
      cutoffDate = new Date(fromDate);
      endDate = new Date(toDate);
    } else {
      // Fallback to days calculation
      cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      endDate = new Date(); // Current date
    }
    
    // Base where conditions
    let whereConditions = [
      gte(mentionsClassify.inserttime, cutoffDate.toISOString())
    ];
    
    // Add end date condition if we have explicit dates
    if (fromDate && toDate) {
      whereConditions.push(
        sql`${mentionsClassify.inserttime} <= ${endDate.toISOString()}`
      );
    }
    
    if (platform && platform !== 'all') {
      whereConditions.push(
        sql`LOWER(${mentionsClassify.type}) LIKE ${`%${platform.toLowerCase()}%`}`
      );
    }
    
    if (unit && unit !== 'all') {
      whereConditions.push(
        sql`LOWER(${mentionsClassify.groupname}) LIKE ${`%${unit.toLowerCase()}%`}`
      );
    }
    
    // 1. Get raw mentions data
    const mentions = await db
      .select()
      .from(mentionsClassify)
      .where(and(...whereConditions))
      .orderBy(desc(mentionsClassify.inserttime))
      .limit(10000);
    
    // 2. Get aggregated metrics
    const [metrics] = await db
      .select({
        totalMentions: count(),
        totalReach: sum(mentionsClassify.reach),
        totalInteractions: sql`SUM(COALESCE(${mentionsClassify.likecount}, 0) + COALESCE(${mentionsClassify.sharecount}, 0) + COALESCE(${mentionsClassify.commentcount}, 0))`,
        avgEngagement: avg(mentionsClassify.engagementrate)
      })
      .from(mentionsClassify)
      .where(and(...whereConditions));
    
    // 3. Get sentiment breakdown
    const sentimentBreakdown = await db
      .select({
        sentiment: mentionsClassify.sentiment,
        count: count()
      })
      .from(mentionsClassify)
      .where(and(...whereConditions))
      .groupBy(mentionsClassify.sentiment);
    
    // 4. Get platform distribution
    const platformDistribution = await db
      .select({
        platform: mentionsClassify.type,
        count: count(),
        totalReach: sum(mentionsClassify.reach)
      })
      .from(mentionsClassify)
      .where(and(...whereConditions))
      .groupBy(mentionsClassify.type)
      .orderBy(desc(count()));
    
    // 5. Get daily trends (mentions over time)
    const dailyTrends = await db
      .select({
        date: sql`DATE(${mentionsClassify.inserttime})`.as('date'),
        count: count(),
        positive: sql`SUM(CASE WHEN LOWER(${mentionsClassify.sentiment}) = 'positive' THEN 1 ELSE 0 END)`.as('positive'),
        negative: sql`SUM(CASE WHEN LOWER(${mentionsClassify.sentiment}) = 'negative' THEN 1 ELSE 0 END)`.as('negative'),
        neutral: sql`SUM(CASE WHEN LOWER(${mentionsClassify.sentiment}) = 'neutral' THEN 1 ELSE 0 END)`.as('neutral'),
        totalReach: sum(mentionsClassify.reach),
        totalInteractions: sql`SUM(COALESCE(${mentionsClassify.likecount}, 0) + COALESCE(${mentionsClassify.sharecount}, 0) + COALESCE(${mentionsClassify.commentcount}, 0))`
      })
      .from(mentionsClassify)
      .where(and(...whereConditions))
      .groupBy(sql`DATE(${mentionsClassify.inserttime})`)
      .orderBy(sql`DATE(${mentionsClassify.inserttime})`);
    
    // 6. Get top mentions by reach
    const topMentions = await db
      .select()
      .from(mentionsClassify)
      .where(and(...whereConditions))
      .orderBy(desc(mentionsClassify.reach))
      .limit(10);
    
    // 7. Get influencer mentions (high follower count)
    const influencerMentions = await db
      .select({
        count: count(),
        totalReach: sum(mentionsClassify.reach)
      })
      .from(mentionsClassify)
      .where(and(
        ...whereConditions,
        sql`COALESCE(${mentionsClassify.followerscount}, ${mentionsClassify.authorfollowercount}, 0) > 10000`
      ));
    
    const response = {
      // Raw data for detailed analysis
      mentions,
      
      // Aggregated metrics
      metrics: {
        totalMentions: parseInt(metrics.totalMentions) || 0,
        totalReach: parseInt(metrics.totalReach) || 0,
        totalInteractions: parseInt(metrics.totalInteractions) || 0,
        avgEngagement: parseFloat(metrics.avgEngagement) || 0,
        influencerMentions: parseInt(influencerMentions[0]?.count) || 0
      },
      
      // Sentiment data
      sentiment: {
        breakdown: sentimentBreakdown.map(s => ({
          sentiment: s.sentiment || 'unknown',
          count: parseInt(s.count)
        })),
        trend: dailyTrends.map(d => ({
          date: d.date,
          positive: parseInt(d.positive),
          negative: parseInt(d.negative),
          neutral: parseInt(d.neutral)
        }))
      },
      
      // Platform data
      platforms: platformDistribution.map(p => ({
        platform: p.platform,
        count: parseInt(p.count),
        totalReach: parseInt(p.totalReach) || 0
      })),
      
      // Time series data
      timeSeries: dailyTrends.map(d => ({
        date: d.date,
        mentions: parseInt(d.count),
        reach: parseInt(d.totalReach) || 0,
        interactions: parseInt(d.totalInteractions) || 0
      })),
      
      // Top performing content
      topContent: topMentions,
      
      // Metadata
      meta: {
        queryDate: new Date().toISOString(),
        dateRange: days,
        filters: {
          platform: platform || 'all',
          unit: unit || 'all'
        }
      }
    };
    
    console.log(`Dashboard API: Processed ${mentions.length} mentions`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }
}
// Enhanced API for dashboard data with caching

import { db } from '../../../index';
import { mentionsClassify } from '@/lib/schema';
import { desc, gte, and, sql, count, sum, avg } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import cacheManager, { createFiltersFromParams, buildWhereConditions } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = createFiltersFromParams(searchParams);
    
    // Use cached query for comprehensive dashboard data
    const result = await cacheManager.cachedQuery(
      'dashboard_comprehensive',
      filters,
      async () => {
        const whereConditions = buildWhereConditions(filters, mentionsClassify);
        
        // Run all database queries concurrently for better performance
        const [
          mentions,
          [metrics],
          sentimentBreakdown,
          platformDistribution,
          dailyTrends,
          topMentions,
          influencerMentions,
          channelGroupBreakdown
        ] = await Promise.all([
          // 1. Get limited raw mentions data (for tables)
          db
            .select()
            .from(mentionsClassify)
            .where(and(...whereConditions))
            .orderBy(desc(mentionsClassify.inserttime))
            .limit(parseInt(filters.limit) || 20000),
           
          // 2. Get aggregated metrics
          db
            .select({
              totalMentions: count(),
              totalReach: sum(mentionsClassify.reach),
              totalInteractions: sql`SUM(COALESCE(${mentionsClassify.likecount}, 0) + COALESCE(${mentionsClassify.sharecount}, 0) + COALESCE(${mentionsClassify.commentcount}, 0))`,
              avgEngagement: avg(mentionsClassify.engagementrate)
            })
            .from(mentionsClassify)
            .where(and(...whereConditions)),
          
          // 3. Get sentiment breakdown
          db
            .select({
              sentiment: mentionsClassify.sentiment,
              count: count()
            })
            .from(mentionsClassify)
            .where(and(...whereConditions))
            .groupBy(mentionsClassify.sentiment),
          
          // 4. Get platform distribution
          db
            .select({
              platform: mentionsClassify.type,
              count: count(),
              totalReach: sum(mentionsClassify.reach)
            })
            .from(mentionsClassify)
            .where(and(...whereConditions))
            .groupBy(mentionsClassify.type)
            .orderBy(desc(count())),
          
          // 5. Get daily trends (mentions over time)
          db
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
            .orderBy(sql`DATE(${mentionsClassify.inserttime})`),
          
          // 6. Get top mentions by reach
          db
            .select()
            .from(mentionsClassify)
            .where(and(...whereConditions))
            .orderBy(desc(mentionsClassify.reach))
            .limit(10),
          
          // 7. Get influencer mentions (high follower count)
          db
            .select({
              count: count(),
              totalReach: sum(mentionsClassify.reach)
            })
            .from(mentionsClassify)
            .where(and(
              ...whereConditions,
              sql`COALESCE(${mentionsClassify.followerscount}, ${mentionsClassify.authorfollowercount}, 0) > 10000`
            )),

          // 8. Get channel group breakdown (for radio stations and other channels)
          db
            .select({
              groupname: mentionsClassify.groupname,
              channel: mentionsClassify.channel,
              channelgroup: mentionsClassify.channelgroup,
              count: count(),
              totalReach: sum(mentionsClassify.reach)
            })
            .from(mentionsClassify)
            .where(and(...whereConditions))
            .groupBy(mentionsClassify.groupname, mentionsClassify.channel, mentionsClassify.channelgroup)
            .orderBy(desc(count()))
            .limit(100)
        ]);
        
        const response = {
          // Raw data for detailed analysis (limited for performance)
          mentions: mentions.slice(0, 10000), // Limit raw data in cached response
          
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
          
          // Channel group breakdown (includes new channelgroup field)
          channelGroups: channelGroupBreakdown.map(c => ({
            groupname: c.groupname,
            channel: c.channel,
            channelgroup: c.channelgroup,
            count: parseInt(c.count),
            totalReach: parseInt(c.totalReach) || 0
          })),
          
          // Top performing content
          topContent: topMentions,
          
          // Metadata
          meta: {
            queryDate: new Date().toISOString(),
            filters,
            cached: true,
            dataLimited: mentions.length >= 10000
          }
        };
        
        return response;
      },
      300 // 5 minutes cache
    );
    
    console.log(`Dashboard API: Processed data with caching (${result._cache?.hit ? 'HIT' : 'MISS'})`);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }
}
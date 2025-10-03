/**
 * Dashboard Summary API with Caching
 * Provides key metrics and KPIs for dashboard overview
 */

import { db } from '../../../index';
import { mentionsClassify } from '@/lib/schema';
import { and, sql, count, sum, avg, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import cacheManager, { createFiltersFromParams, buildWhereConditions } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = createFiltersFromParams(searchParams);
    
    // Use cached query for dashboard summary
    const result = await cacheManager.cachedQuery(
      'dashboard_summary',
      filters,
      async () => {
        const whereConditions = buildWhereConditions(filters, mentionsClassify);
        
        // Run all main queries concurrently
        const [
          [overallMetrics],
          sentimentData,
          topPlatforms,
          trendingTopics
        ] = await Promise.all([
          // Get overall metrics
          db
            .select({
              totalMentions: count(),
              totalReach: sum(mentionsClassify.reach),
              totalInteractions: sql`SUM(
                COALESCE(${mentionsClassify.likecount}, 0) + 
                COALESCE(${mentionsClassify.sharecount}, 0) + 
                COALESCE(${mentionsClassify.commentcount}, 0)
              )`.as('totalInteractions'),
              avgEngagement: avg(mentionsClassify.engagementrate),
              totalViews: sum(mentionsClassify.viewcount),
              avgInfluenceScore: avg(mentionsClassify.influencescore),
              influencerMentions: sql`SUM(CASE WHEN COALESCE(${mentionsClassify.followerscount}, ${mentionsClassify.authorfollowercount}, 0) > 10000 THEN 1 ELSE 0 END)`.as('influencerMentions'),
              totalFollowers: sum(sql`COALESCE(${mentionsClassify.followerscount}, ${mentionsClassify.authorfollowercount}, 0)`)
            })
            .from(mentionsClassify)
            .where(and(...whereConditions)),
          
          // Get sentiment distribution
          db
            .select({
              sentiment: mentionsClassify.sentiment,
              count: count(),
              avgEngagement: avg(mentionsClassify.engagementrate),
              totalReach: sum(mentionsClassify.reach)
            })
            .from(mentionsClassify)
            .where(and(...whereConditions))
            .groupBy(mentionsClassify.sentiment),
          
          // Get top platforms
          db
            .select({
              platform: mentionsClassify.type,
              count: count(),
              totalReach: sum(mentionsClassify.reach),
              avgEngagement: avg(mentionsClassify.engagementrate)
            })
            .from(mentionsClassify)
            .where(and(...whereConditions))
            .groupBy(mentionsClassify.type)
            .orderBy(desc(count()))
            .limit(5),
           
          // Get recent trending topics (top units/groups)
          db
            .select({
              topic: mentionsClassify.groupname,
              count: count(),
              totalReach: sum(mentionsClassify.reach),
              positiveCount: sql`SUM(CASE WHEN LOWER(${mentionsClassify.sentiment}) = 'positive' THEN 1 ELSE 0 END)`.as('positiveCount'),
              negativeCount: sql`SUM(CASE WHEN LOWER(${mentionsClassify.sentiment}) = 'negative' THEN 1 ELSE 0 END)`.as('negativeCount')
            })
            .from(mentionsClassify)
            .where(and(...whereConditions))
            .groupBy(mentionsClassify.groupname)
            .orderBy(desc(count()))
            .limit(10)
        ]);
        
        // Get daily comparison (current period vs previous period)
        const currentPeriodDays = parseInt(String(filters.days)) || 30;
        const previousPeriodStart = new Date();
        previousPeriodStart.setDate(previousPeriodStart.getDate() - (currentPeriodDays * 2));
        const previousPeriodEnd = new Date();
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - currentPeriodDays);
        
        // Build previous period conditions
        let previousWhereConditions = [
          sql`${mentionsClassify.inserttime} >= ${previousPeriodStart.toISOString()}`,
          sql`${mentionsClassify.inserttime} < ${previousPeriodEnd.toISOString()}`
        ];
        
        if (filters.platform && filters.platform !== 'all') {
          previousWhereConditions.push(
            sql`LOWER(${mentionsClassify.type}) LIKE ${`%${filters.platform.toLowerCase()}%`}`
          );
        }
        
        const [previousMetrics] = await db
          .select({
            totalMentions: count(),
            totalReach: sum(mentionsClassify.reach),
            totalInteractions: sql`SUM(
              COALESCE(${mentionsClassify.likecount}, 0) + 
              COALESCE(${mentionsClassify.sharecount}, 0) + 
              COALESCE(${mentionsClassify.commentcount}, 0)
            )`.as('totalInteractions'),
            avgEngagement: avg(mentionsClassify.engagementrate)
          })
          .from(mentionsClassify)
          .where(and(...previousWhereConditions));
        
        // Calculate percentage changes
        const calculateChange = (current, previous) => {
          if (!previous || previous === 0) return 0;
          return ((current - previous) / previous * 100).toFixed(1);
        };
        
        const currentTotal = Number(overallMetrics.totalMentions) || 0;
        const previousTotal = Number(previousMetrics.totalMentions) || 0;
        const currentReach = Number(overallMetrics.totalReach) || 0;
        const previousReach = Number(previousMetrics.totalReach) || 0;
        const currentInteractions = Number(overallMetrics.totalInteractions) || 0;
        const previousInteractions = Number(previousMetrics.totalInteractions) || 0;
        const currentEngagement = Number(overallMetrics.avgEngagement) || 0;
        const previousEngagement = Number(previousMetrics.avgEngagement) || 0;
        
        // Format sentiment data
        const formattedSentiment = sentimentData.map(item => ({
          sentiment: item.sentiment || 'unknown',
          count: Number(item.count),
          percentage: currentTotal > 0 ? ((Number(item.count) / currentTotal) * 100).toFixed(1) : 0,
          avgEngagement: Number(item.avgEngagement) || 0,
          totalReach: Number(item.totalReach) || 0
        }));
        
        // Format platform data
        const formattedPlatforms = topPlatforms.map(item => ({
          platform: item.platform || 'unknown',
          count: Number(item.count),
          percentage: currentTotal > 0 ? ((Number(item.count) / currentTotal) * 100).toFixed(1) : 0,
          totalReach: Number(item.totalReach) || 0,
          avgEngagement: Number(item.avgEngagement) || 0
        }));
        
        // Format trending topics
        const formattedTopics = trendingTopics.map(item => {
          const count = Number(item.count);
          const positive = Number(item.positiveCount) || 0;
          const negative = Number(item.negativeCount) || 0;
          
          return {
            topic: item.topic || 'unknown',
            count,
            totalReach: Number(item.totalReach) || 0,
            sentimentScore: count > 0 ? ((positive - negative) / count * 100).toFixed(1) : 0,
            positiveCount: positive,
            negativeCount: negative
          };
        });
        
        return {
          overview: {
            totalMentions: currentTotal,
            totalReach: currentReach,
            totalInteractions: currentInteractions,
            avgEngagement: currentEngagement,
            totalViews: Number(overallMetrics.totalViews) || 0,
            avgInfluenceScore: Number(overallMetrics.avgInfluenceScore) || 0,
            influencerMentions: Number(overallMetrics.influencerMentions) || 0,
            totalFollowers: Number(overallMetrics.totalFollowers) || 0,
            
            // Calculated metrics
            engagementRate: currentReach > 0 ? ((currentInteractions / currentReach) * 100).toFixed(2) : 0,
            influencerPercentage: currentTotal > 0 ? 
              ((Number(overallMetrics.influencerMentions) || 0) / currentTotal * 100).toFixed(1) : 0,
            avgFollowersPerMention: currentTotal > 0 ? 
              Math.round((Number(overallMetrics.totalFollowers) || 0) / currentTotal) : 0
          },
          
          periodComparison: {
            mentions: {
              current: currentTotal,
              previous: previousTotal,
              change: calculateChange(currentTotal, previousTotal),
              trend: currentTotal > previousTotal ? 'up' : currentTotal < previousTotal ? 'down' : 'stable'
            },
            reach: {
              current: currentReach,
              previous: previousReach,
              change: calculateChange(currentReach, previousReach),
              trend: currentReach > previousReach ? 'up' : currentReach < previousReach ? 'down' : 'stable'
            },
            interactions: {
              current: currentInteractions,
              previous: previousInteractions,
              change: calculateChange(currentInteractions, previousInteractions),
              trend: currentInteractions > previousInteractions ? 'up' : currentInteractions < previousInteractions ? 'down' : 'stable'
            },
            engagement: {
              current: currentEngagement,
              previous: previousEngagement,
              change: calculateChange(currentEngagement, previousEngagement),
              trend: currentEngagement > previousEngagement ? 'up' : currentEngagement < previousEngagement ? 'down' : 'stable'
            }
          },
          
          sentiment: formattedSentiment,
          topPlatforms: formattedPlatforms,
          trendingTopics: formattedTopics,
          
          meta: {
            queryType: 'dashboard_summary',
            timestamp: new Date().toISOString(),
            filters,
            comparisonPeriod: `${currentPeriodDays} days`
          }
        };
      },
      300 // 5 minutes cache
    );
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Dashboard Summary API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary', details: error.message },
      { status: 500 }
    );
  }
}

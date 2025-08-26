/**
 * Platform Distribution API with Caching
 * Provides aggregated platform data for bar charts
 */

import { db } from '../../../index';
import { mentionsClassify } from '@/lib/schema';
import { and, sql, count, sum, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import cacheManager, { createFiltersFromParams, buildWhereConditions } from '@/lib/cache';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = createFiltersFromParams(searchParams);
    
    // Use cached query for platform distribution
    const result = await cacheManager.cachedQuery(
      'platform_distribution',
      filters,
      async () => {
        const whereConditions = buildWhereConditions(filters, mentionsClassify);
        
        // Get platform distribution with engagement metrics (concurrent execution)
        const platformData = await db
          .select({
            platform: mentionsClassify.type,
            count: count(),
            totalReach: sum(mentionsClassify.reach),
            totalInteractions: sql`SUM(
              COALESCE(${mentionsClassify.likecount}, 0) + 
              COALESCE(${mentionsClassify.sharecount}, 0) + 
              COALESCE(${mentionsClassify.commentcount}, 0)
            )`.as('totalInteractions'),
            avgEngagement: sql`AVG(COALESCE(${mentionsClassify.engagementrate}, 0))`.as('avgEngagement'),
            totalFollowers: sum(sql`COALESCE(${mentionsClassify.followerscount}, ${mentionsClassify.authorfollowercount}, 0)`),
            // Sentiment breakdown per platform
            positiveCount: sql`SUM(CASE WHEN LOWER(${mentionsClassify.sentiment}) = 'positive' THEN 1 ELSE 0 END)`.as('positiveCount'),
            negativeCount: sql`SUM(CASE WHEN LOWER(${mentionsClassify.sentiment}) = 'negative' THEN 1 ELSE 0 END)`.as('negativeCount'),
            neutralCount: sql`SUM(CASE WHEN LOWER(${mentionsClassify.sentiment}) = 'neutral' THEN 1 ELSE 0 END)`.as('neutralCount')
          })
          .from(mentionsClassify)
          .where(and(...whereConditions))
          .groupBy(mentionsClassify.type)
          .orderBy(desc(count()));
        
        // Calculate totals and percentages
        const totalMentions = platformData.reduce((sum, item) => sum + parseInt(item.count), 0);
        const totalReach = platformData.reduce((sum, item) => sum + (parseInt(item.totalReach) || 0), 0);
        
        const formattedData = platformData.map(item => {
          const count = parseInt(item.count);
          const reach = parseInt(item.totalReach) || 0;
          
          return {
            platform: item.platform || 'unknown',
            count,
            percentage: totalMentions > 0 ? ((count / totalMentions) * 100).toFixed(1) : 0,
            totalReach: reach,
            reachPercentage: totalReach > 0 ? ((reach / totalReach) * 100).toFixed(1) : 0,
            totalInteractions: parseInt(item.totalInteractions) || 0,
            avgEngagement: parseFloat(item.avgEngagement) || 0,
            totalFollowers: parseInt(item.totalFollowers) || 0,
            sentiment: {
              positive: parseInt(item.positiveCount) || 0,
              negative: parseInt(item.negativeCount) || 0,
              neutral: parseInt(item.neutralCount) || 0
            },
            // Calculate engagement rate
            engagementRate: reach > 0 ? (((parseInt(item.totalInteractions) || 0) / reach) * 100).toFixed(2) : 0
          };
        });
        
        return {
          data: formattedData,
          summary: {
            totalMentions,
            totalReach,
            totalPlatforms: formattedData.length,
            topPlatform: formattedData[0]?.platform || 'unknown',
            avgEngagementAcrossPlatforms: formattedData.reduce((sum, p) => sum + parseFloat(p.avgEngagement), 0) / formattedData.length
          },
          meta: {
            queryType: 'platform_distribution',
            timestamp: new Date().toISOString(),
            filters
          }
        };
      },
      300 // 5 minutes cache
    );
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Platform Distribution API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform distribution', details: error.message },
      { status: 500 }
    );
  }
}

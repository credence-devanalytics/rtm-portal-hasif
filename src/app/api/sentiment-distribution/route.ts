/**
 * Sentiment Distribution API with Caching
 * Provides aggregated sentiment data for donut/pie charts
 */

import { db } from '../../../index';
import { mentionsClassify } from '@/lib/schema';
import { and, sql, count } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import cacheManager, { createFiltersFromParams, buildWhereConditions } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = createFiltersFromParams(searchParams);
    
    // Use cached query for sentiment distribution
    const result = await cacheManager.cachedQuery(
      'sentiment_distribution',
      filters,
      async () => {
        const whereConditions = buildWhereConditions(filters, mentionsClassify);
        
        // Get sentiment breakdown with additional metrics (concurrent execution)
        const sentimentData = await db
          .select({
            sentiment: mentionsClassify.sentiment,
            count: count(),
            totalReach: sql`SUM(COALESCE(${mentionsClassify.reach}, 0))`.as('totalReach'),
            totalInteractions: sql`SUM(
              COALESCE(${mentionsClassify.likecount}, 0) + 
              COALESCE(${mentionsClassify.sharecount}, 0) + 
              COALESCE(${mentionsClassify.commentcount}, 0)
            )`.as('totalInteractions'),
            avgEngagement: sql`AVG(COALESCE(${mentionsClassify.engagementrate}, 0))`.as('avgEngagement')
          })
          .from(mentionsClassify)
          .where(and(...whereConditions))
          .groupBy(mentionsClassify.sentiment);
        
        // Calculate percentages and format data
        const totalMentions = sentimentData.reduce((sum, item) => sum + parseInt(String(item.count)), 0);
        
        const formattedData = sentimentData.map(item => ({
          sentiment: item.sentiment || 'unknown',
          count: parseInt(String(item.count)),
          percentage: totalMentions > 0 ? ((parseInt(String(item.count)) / totalMentions) * 100).toFixed(1) : 0,
          totalReach: parseInt(String(item.totalReach)) || 0,
          totalInteractions: parseInt(String(item.totalInteractions)) || 0,
          avgEngagement: parseFloat(String(item.avgEngagement)) || 0
        }));
        
        // Sort by count descending
        formattedData.sort((a, b) => b.count - a.count);
        
        return {
          data: formattedData,
          summary: {
            totalMentions,
            totalSentiments: formattedData.length,
            dominantSentiment: formattedData[0]?.sentiment || 'unknown'
          },
          meta: {
            queryType: 'sentiment_distribution',
            timestamp: new Date().toISOString(),
            filters
          }
        };
      },
      300 // 5 minutes cache
    );
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Sentiment Distribution API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sentiment distribution', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Social Media Metrics API
 * Provides aggregated metrics for total posts, reach, and interactions
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mentionsClassifyPublic } from '@/lib/schema';
import { gte, lte, and, sql, count, sum, avg, inArray, like } from 'drizzle-orm';

// Helper function to build WHERE conditions (shared with other APIs)
const buildWhereConditions = (filters) => {
  const conditions = [];

  // Date range filters
  if (filters.dateRange?.from) {
    conditions.push(gte(mentionsClassifyPublic.inserttime, `${filters.dateRange.from}T00:00:00.000Z`));
  }
  
  if (filters.dateRange?.to) {
    conditions.push(lte(mentionsClassifyPublic.inserttime, `${filters.dateRange.to}T23:59:59.999Z`));
  }

  // Sentiment filters
  if (filters.sentiments && filters.sentiments.length > 0) {
    conditions.push(inArray(mentionsClassifyPublic.autosentiment, filters.sentiments));
  }

  // Source/Platform filters
  if (filters.sources && filters.sources.length > 0) {
    const sourceConditions = filters.sources.map(source => 
      like(mentionsClassifyPublic.type, `%${source}%`)
    );
    if (sourceConditions.length === 1) {
      conditions.push(sourceConditions[0]);
    } else {
      conditions.push(sql`(${sourceConditions.join(' OR ')})`);
    }
  }

  return conditions;
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const sentimentsParam = searchParams.get('sentiments');
    const sourcesParam = searchParams.get('sources');
    const dateFromParam = searchParams.get('date_from');
    const dateToParam = searchParams.get('date_to');

    // Process filters
    const filters = {
      sentiments: sentimentsParam ? sentimentsParam.split(',') : [],
      sources: sourcesParam ? sourcesParam.split(',') : [],
      dateRange: {
        from: dateFromParam,
        to: dateToParam
      }
    };

    console.log('📈 Metrics API - Processing filters:', filters);

    // Build WHERE conditions
    const whereConditions = buildWhereConditions(filters);
    
    // Base condition to only include records with valid sentiment
    const baseConditions = [
      sql`${mentionsClassifyPublic.autosentiment} IS NOT NULL`
    ];
    
    const allConditions = [...baseConditions, ...whereConditions];

    try {
      // Get aggregated metrics
      const [metricsResult] = await db
        .select({
          totalPosts: count(),
          totalMentions: count(),
          totalReach: sum(mentionsClassifyPublic.reach),
          totalInteractions: sql`SUM(
            COALESCE(${mentionsClassifyPublic.likecount}, 0) + 
            COALESCE(${mentionsClassifyPublic.sharecount}, 0) + 
            COALESCE(${mentionsClassifyPublic.commentcount}, 0)
          )`,
          avgEngagement: avg(mentionsClassifyPublic.engagementrate),
          avgConfidence: avg(mentionsClassifyPublic.confidence)
        })
        .from(mentionsClassifyPublic)
        .where(and(...allConditions));

      // Process metrics data
      const metricsData = {
        totalPosts: parseInt(metricsResult.totalPosts) || 0,
        totalMentions: parseInt(metricsResult.totalMentions) || 0,
        totalReach: parseInt(metricsResult.totalReach) || 0,
        totalInteractions: parseInt(metricsResult.totalInteractions) || 0,
        avgEngagement: parseFloat(metricsResult.avgEngagement) || 0,
        avgConfidence: parseFloat(metricsResult.avgConfidence) || 0
      };

      console.log('📊 Metrics data processed:', metricsData);

      const response = {
        success: true,
        data: metricsData,
        meta: {
          filters,
          queryTime: new Date().toISOString(),
          dataSource: 'database'
        }
      };

      return NextResponse.json(response);

    } catch (dbError) {
      console.error('❌ Database error, using fallback metrics:', dbError.message);
      
      // Fallback metrics when database is unavailable
      const fallbackMetrics = {
        totalPosts: 425,
        totalMentions: 425,
        totalReach: 1250000,
        totalInteractions: 45000,
        avgEngagement: 3.6,
        avgConfidence: 0.82
      };

      return NextResponse.json({
        success: true,
        data: fallbackMetrics,
        meta: {
          filters,
          queryTime: new Date().toISOString(),
          dataSource: 'fallback',
          warning: 'Using fallback data due to database connectivity issues'
        }
      });
    }

  } catch (error) {
    console.error('🚨 Metrics API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch metrics data', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
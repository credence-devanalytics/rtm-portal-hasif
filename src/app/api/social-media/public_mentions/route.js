/**
 * Social Media Public Mentions API
 * Enhanced endpoint with proper filter processing and response structure
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mentionsClassifyPublic } from '@/lib/schema';
import { desc, gte, lte, and, sql, count, sum, avg, inArray, like } from 'drizzle-orm';

// Helper function to build WHERE conditions
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

    console.log('🎯 Social Media API - Processing filters:', filters);

    // Build WHERE conditions
    const whereConditions = buildWhereConditions(filters);
    
    // Base condition to only include records with valid sentiment
    const baseConditions = [
      sql`${mentionsClassifyPublic.autosentiment} IS NOT NULL`
    ];
    
    const allConditions = [...baseConditions, ...whereConditions];

    try {
      // Get sentiment counts
      const sentimentCounts = await db
        .select({
          sentiment: mentionsClassifyPublic.autosentiment,
          count: count(),
          avgConfidence: avg(mentionsClassifyPublic.confidence)
        })
        .from(mentionsClassifyPublic)
        .where(and(...allConditions))
        .groupBy(mentionsClassifyPublic.autosentiment);

      // Process sentiment data
      const sentimentData = {
        positive: 0,
        negative: 0,
        neutral: 0
      };

      sentimentCounts.forEach(item => {
        const sentiment = item.sentiment?.toLowerCase();
        if (sentiment && sentimentData.hasOwnProperty(sentiment)) {
          sentimentData[sentiment] = parseInt(item.count);
        }
      });

      console.log('📊 Sentiment data processed:', sentimentData);

      const response = {
        success: true,
        data: sentimentData,
        meta: {
          filters,
          queryTime: new Date().toISOString(),
          dataSource: 'database',
          totalRecords: Object.values(sentimentData).reduce((sum, count) => sum + count, 0)
        }
      };

      return NextResponse.json(response);

    } catch (dbError) {
      console.error('❌ Database error, using fallback data:', dbError.message);
      
      // Fallback data when database is unavailable
      const fallbackData = {
        positive: 150,
        negative: 75,
        neutral: 200
      };

      return NextResponse.json({
        success: true,
        data: fallbackData,
        meta: {
          filters,
          queryTime: new Date().toISOString(),
          dataSource: 'fallback',
          warning: 'Using fallback data due to database connectivity issues',
          totalRecords: Object.values(fallbackData).reduce((sum, count) => sum + count, 0)
        }
      });
    }

  } catch (error) {
    console.error('🚨 Social Media API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch social media mentions data', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
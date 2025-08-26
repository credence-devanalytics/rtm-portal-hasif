/**
 * Time Series API with Caching
 * Provides aggregated time-based data for line/area charts
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
    
    // Get granularity parameter (daily, hourly, weekly)
    const granularity = searchParams.get('granularity') || 'daily';
    
    // Use cached query for time series data
    const result = await cacheManager.cachedQuery(
      `time_series_${granularity}`,
      filters,
      async () => {
        const whereConditions = buildWhereConditions(filters, mentionsClassify);
        
        // Choose date grouping based on granularity
        let dateGroup;
        switch (granularity) {
          case 'hourly':
            dateGroup = sql`DATE_TRUNC('hour', ${mentionsClassify.inserttime})`;
            break;
          case 'weekly':
            dateGroup = sql`DATE_TRUNC('week', ${mentionsClassify.inserttime})`;
            break;
          case 'monthly':
            dateGroup = sql`DATE_TRUNC('month', ${mentionsClassify.inserttime})`;
            break;
          default: // daily
            dateGroup = sql`DATE(${mentionsClassify.inserttime})`;
        }
        
        // Get time series data with comprehensive metrics (concurrent execution)
        const timeSeriesData = await db
          .select({
            date: dateGroup.as('date'),
            count: count(),
            totalReach: sum(mentionsClassify.reach),
            totalInteractions: sql`SUM(
              COALESCE(${mentionsClassify.likecount}, 0) + 
              COALESCE(${mentionsClassify.sharecount}, 0) + 
              COALESCE(${mentionsClassify.commentcount}, 0)
            )`.as('totalInteractions'),
            avgEngagement: sql`AVG(COALESCE(${mentionsClassify.engagementrate}, 0))`.as('avgEngagement'),
            
            // Sentiment breakdown per time period
            positiveCount: sql`SUM(CASE WHEN LOWER(${mentionsClassify.sentiment}) = 'positive' THEN 1 ELSE 0 END)`.as('positiveCount'),
            negativeCount: sql`SUM(CASE WHEN LOWER(${mentionsClassify.sentiment}) = 'negative' THEN 1 ELSE 0 END)`.as('negativeCount'),
            neutralCount: sql`SUM(CASE WHEN LOWER(${mentionsClassify.sentiment}) = 'neutral' THEN 1 ELSE 0 END)`.as('neutralCount'),
            
            // Platform breakdown per time period
            facebookCount: sql`SUM(CASE WHEN LOWER(${mentionsClassify.type}) LIKE '%facebook%' THEN 1 ELSE 0 END)`.as('facebookCount'),
            twitterCount: sql`SUM(CASE WHEN LOWER(${mentionsClassify.type}) LIKE '%twitter%' THEN 1 ELSE 0 END)`.as('twitterCount'),
            instagramCount: sql`SUM(CASE WHEN LOWER(${mentionsClassify.type}) LIKE '%instagram%' THEN 1 ELSE 0 END)`.as('instagramCount'),
            tiktokCount: sql`SUM(CASE WHEN LOWER(${mentionsClassify.type}) LIKE '%tiktok%' THEN 1 ELSE 0 END)`.as('tiktokCount'),
            youtubeCount: sql`SUM(CASE WHEN LOWER(${mentionsClassify.type}) LIKE '%youtube%' THEN 1 ELSE 0 END)`.as('youtubeCount'),
            
            // Engagement metrics
            avgViews: sql`AVG(COALESCE(${mentionsClassify.viewcount}, 0))`.as('avgViews'),
            avgLikes: sql`AVG(COALESCE(${mentionsClassify.likecount}, 0))`.as('avgLikes'),
            avgShares: sql`AVG(COALESCE(${mentionsClassify.sharecount}, 0))`.as('avgShares'),
            avgComments: sql`AVG(COALESCE(${mentionsClassify.commentcount}, 0))`.as('avgComments'),
            
            // Influence metrics
            influencerMentions: sql`SUM(CASE WHEN COALESCE(${mentionsClassify.followerscount}, ${mentionsClassify.authorfollowercount}, 0) > 10000 THEN 1 ELSE 0 END)`.as('influencerMentions'),
            totalFollowers: sum(sql`COALESCE(${mentionsClassify.followerscount}, ${mentionsClassify.authorfollowercount}, 0)`)
          })
          .from(mentionsClassify)
          .where(and(...whereConditions))
          .groupBy(dateGroup)
          .orderBy(dateGroup);
        
        // Format and enrich the data
        const formattedData = timeSeriesData.map(item => {
          const count = parseInt(item.count);
          const reach = parseInt(item.totalReach) || 0;
          const interactions = parseInt(item.totalInteractions) || 0;
          
          return {
            date: item.date,
            timestamp: new Date(item.date).getTime(),
            
            // Basic metrics
            mentions: count,
            reach: reach,
            interactions: interactions,
            avgEngagement: parseFloat(item.avgEngagement) || 0,
            
            // Sentiment distribution
            sentiment: {
              positive: parseInt(item.positiveCount) || 0,
              negative: parseInt(item.negativeCount) || 0,
              neutral: parseInt(item.neutralCount) || 0,
              positivePercent: count > 0 ? ((parseInt(item.positiveCount) || 0) / count * 100).toFixed(1) : 0,
              negativePercent: count > 0 ? ((parseInt(item.negativeCount) || 0) / count * 100).toFixed(1) : 0
            },
            
            // Platform distribution
            platforms: {
              facebook: parseInt(item.facebookCount) || 0,
              twitter: parseInt(item.twitterCount) || 0,
              instagram: parseInt(item.instagramCount) || 0,
              tiktok: parseInt(item.tiktokCount) || 0,
              youtube: parseInt(item.youtubeCount) || 0
            },
            
            // Engagement details
            engagement: {
              avgViews: parseFloat(item.avgViews) || 0,
              avgLikes: parseFloat(item.avgLikes) || 0,
              avgShares: parseFloat(item.avgShares) || 0,
              avgComments: parseFloat(item.avgComments) || 0,
              engagementRate: reach > 0 ? ((interactions / reach) * 100).toFixed(2) : 0
            },
            
            // Influence metrics
            influence: {
              influencerMentions: parseInt(item.influencerMentions) || 0,
              totalFollowers: parseInt(item.totalFollowers) || 0,
              avgFollowersPerMention: count > 0 ? Math.round((parseInt(item.totalFollowers) || 0) / count) : 0
            }
          };
        });
        
        // Calculate summary statistics
        const summary = {
          totalDays: formattedData.length,
          granularity,
          totalMentions: formattedData.reduce((sum, d) => sum + d.mentions, 0),
          totalReach: formattedData.reduce((sum, d) => sum + d.reach, 0),
          totalInteractions: formattedData.reduce((sum, d) => sum + d.interactions, 0),
          avgMentionsPerPeriod: formattedData.length > 0 ? 
            Math.round(formattedData.reduce((sum, d) => sum + d.mentions, 0) / formattedData.length) : 0,
          peakDay: formattedData.reduce((max, current) => 
            current.mentions > max.mentions ? current : max, formattedData[0] || {}),
          trend: calculateTrend(formattedData)
        };
        
        return {
          data: formattedData,
          summary,
          meta: {
            queryType: `time_series_${granularity}`,
            timestamp: new Date().toISOString(),
            filters,
            granularity
          }
        };
      },
      300 // 5 minutes cache
    );
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Time Series API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time series data', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Calculate trend direction based on first and last week averages
 * @param {Array} data - Time series data
 * @returns {Object} Trend information
 */
function calculateTrend(data) {
  if (data.length < 7) return { direction: 'insufficient_data', percentage: 0 };
  
  const firstWeek = data.slice(0, 7);
  const lastWeek = data.slice(-7);
  
  const firstWeekAvg = firstWeek.reduce((sum, d) => sum + d.mentions, 0) / firstWeek.length;
  const lastWeekAvg = lastWeek.reduce((sum, d) => sum + d.mentions, 0) / lastWeek.length;
  
  if (firstWeekAvg === 0) return { direction: 'no_baseline', percentage: 0 };
  
  const percentageChange = ((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100;
  
  let direction = 'stable';
  if (percentageChange > 5) direction = 'increasing';
  else if (percentageChange < -5) direction = 'decreasing';
  
  return {
    direction,
    percentage: Math.round(percentageChange),
    firstWeekAvg: Math.round(firstWeekAvg),
    lastWeekAvg: Math.round(lastWeekAvg)
  };
}

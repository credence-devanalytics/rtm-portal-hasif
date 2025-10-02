/**
 * Top Mentions API with Caching
 * Provides top performing mentions for tables and detailed views
 */

import { db } from '../../../index';
import { mentionsClassify } from '@/lib/schema';
import { and, sql, desc, asc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import cacheManager, { createFiltersFromParams, buildWhereConditions } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = createFiltersFromParams(searchParams);
    
    // Get sorting and pagination parameters
    const sortBy = searchParams.get('sortBy') || 'reach'; // reach, engagement, interactions, date
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = parseInt(searchParams.get('pageSize')) || 50;
    const offset = (page - 1) * pageSize;
    
    // Use cached query for top mentions
    const result = await cacheManager.cachedQuery(
      `top_mentions_${sortBy}_${sortOrder}_${page}_${pageSize}`,
      filters,
      async () => {
        const whereConditions = buildWhereConditions(filters, mentionsClassify);
        
        // Determine sort column
        let orderByColumn;
        switch (sortBy) {
          case 'engagement':
            orderByColumn = mentionsClassify.engagementrate;
            break;
          case 'interactions':
            orderByColumn = sql`(COALESCE(${mentionsClassify.likecount}, 0) + COALESCE(${mentionsClassify.sharecount}, 0) + COALESCE(${mentionsClassify.commentcount}, 0))`;
            break;
          case 'date':
            orderByColumn = mentionsClassify.inserttime;
            break;
          case 'followers':
            orderByColumn = sql`COALESCE(${mentionsClassify.followerscount}, ${mentionsClassify.authorfollowercount}, 0)`;
            break;
          case 'views':
            orderByColumn = mentionsClassify.viewcount;
            break;
          default: // reach
            orderByColumn = mentionsClassify.reach;
        }
        
        // Run total count and mentions queries concurrently
        const [totalCount, mentions] = await Promise.all([
          // Get total count for pagination
          db
            .select({ count: sql`COUNT(*)`.as('count') })
            .from(mentionsClassify)
            .where(and(...whereConditions)),
          
          // Get the mentions with detailed information
          db
            .select({
              id: mentionsClassify.id,
              type: mentionsClassify.type,
              mention: mentionsClassify.mention,
              author: mentionsClassify.author,
              inserttime: mentionsClassify.inserttime,
              title: mentionsClassify.title,
              url: mentionsClassify.url,
              reach: mentionsClassify.reach,
              sentiment: mentionsClassify.sentiment,
              engagementrate: mentionsClassify.engagementrate,
              
              // Interaction metrics
              likecount: mentionsClassify.likecount,
              sharecount: mentionsClassify.sharecount,
              commentcount: mentionsClassify.commentcount,
              viewcount: mentionsClassify.viewcount,
              
              // Author information
              followerscount: mentionsClassify.followerscount,
              authorfollowercount: mentionsClassify.authorfollowercount,
              
              // Additional metrics
              influencescore: mentionsClassify.influencescore,
              virality: mentionsClassify.virality,
              groupname: mentionsClassify.groupname,
              
              // Platform specific data
              facebookpageid: mentionsClassify.facebookpageid,
              twitterhandle: mentionsClassify.twitterhandle,
              instagramprofilename: mentionsClassify.instagramprofilename,
              
              // Calculated fields
              totalInteractions: sql`(COALESCE(${mentionsClassify.likecount}, 0) + COALESCE(${mentionsClassify.sharecount}, 0) + COALESCE(${mentionsClassify.commentcount}, 0))`.as('totalInteractions'),
              followerCount: sql`COALESCE(${mentionsClassify.followerscount}, ${mentionsClassify.authorfollowercount}, 0)`.as('followerCount'),
              isInfluencer: sql`CASE WHEN COALESCE(${mentionsClassify.followerscount}, ${mentionsClassify.authorfollowercount}, 0) > 10000 THEN true ELSE false END`.as('isInfluencer')
            })
            .from(mentionsClassify)
            .where(and(...whereConditions))
            .orderBy(sortOrder === 'asc' ? asc(orderByColumn) : desc(orderByColumn))
            .limit(pageSize)
            .offset(offset)
        ]);
        
        // Format the data
        const formattedMentions = mentions.map(mention => ({
          id: mention.id,
          platform: mention.type,
          content: mention.mention,
          title: mention.title,
          author: mention.author,
          date: mention.inserttime,
          url: mention.url,
          
          // Metrics
          reach: parseInt(mention.reach) || 0,
          engagement: parseFloat(mention.engagementrate) || 0,
          sentiment: mention.sentiment,
          
          // Interactions
          interactions: {
            total: parseInt(mention.totalInteractions) || 0,
            likes: parseInt(mention.likecount) || 0,
            shares: parseInt(mention.sharecount) || 0,
            comments: parseInt(mention.commentcount) || 0,
            views: parseInt(mention.viewcount) || 0
          },
          
          // Author info
          author_info: {
            name: mention.author,
            followers: parseInt(mention.followerCount) || 0,
            isInfluencer: mention.isInfluencer,
            handle: mention.twitterhandle || mention.instagramprofilename || null
          },
          
          // Additional metrics
          influence_score: parseFloat(mention.influencescore) || 0,
          virality: parseFloat(mention.virality) || 0,
          unit: mention.groupname,
          
          // Platform specific identifiers
          platform_data: {
            facebook_page_id: mention.facebookpageid,
            twitter_handle: mention.twitterhandle,
            instagram_profile: mention.instagramprofilename
          },
          
          // Calculated engagement rate
          calculated_engagement: mention.reach > 0 ? 
            (((parseInt(mention.totalInteractions) || 0) / parseInt(mention.reach)) * 100).toFixed(2) : 0
        }));
        
        // Calculate aggregated statistics for this page
        const pageStats = {
          totalMentions: parseInt(totalCount[0].count),
          currentPage: page,
          pageSize,
          totalPages: Math.ceil(parseInt(totalCount[0].count) / pageSize),
          hasNextPage: page < Math.ceil(parseInt(totalCount[0].count) / pageSize),
          hasPreviousPage: page > 1,
          
          // Page aggregations
          avgReach: formattedMentions.length > 0 ? 
            Math.round(formattedMentions.reduce((sum, m) => sum + m.reach, 0) / formattedMentions.length) : 0,
          avgEngagement: formattedMentions.length > 0 ?
            (formattedMentions.reduce((sum, m) => sum + parseFloat(m.engagement), 0) / formattedMentions.length).toFixed(2) : 0,
          totalInteractions: formattedMentions.reduce((sum, m) => sum + m.interactions.total, 0),
          influencerCount: formattedMentions.filter(m => m.author_info.isInfluencer).length,
          
          // Sentiment breakdown for this page
          sentimentBreakdown: {
            positive: formattedMentions.filter(m => m.sentiment?.toLowerCase() === 'positive').length,
            negative: formattedMentions.filter(m => m.sentiment?.toLowerCase() === 'negative').length,
            neutral: formattedMentions.filter(m => m.sentiment?.toLowerCase() === 'neutral').length
          },
          
          // Platform breakdown for this page
          platformBreakdown: formattedMentions.reduce((acc, mention) => {
            const platform = mention.platform?.toLowerCase() || 'unknown';
            acc[platform] = (acc[platform] || 0) + 1;
            return acc;
          }, {})
        };
        
        return {
          data: formattedMentions,
          pagination: pageStats,
          meta: {
            queryType: 'top_mentions',
            timestamp: new Date().toISOString(),
            filters,
            sorting: { sortBy, sortOrder },
            pagination: { page, pageSize }
          }
        };
      },
      300 // 5 minutes cache
    );
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Top Mentions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top mentions', details: error.message },
      { status: 500 }
    );
  }
}

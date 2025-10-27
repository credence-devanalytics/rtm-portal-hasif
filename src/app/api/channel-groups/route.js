// API to get channel group data for mentions_classify table
// This endpoint specifically handles the new channelgroup column for radio stations

import { getDb } from '../../../lib/db';
import { mentionsClassify } from '@/lib/schema';
import { sql, count, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get('type') || 'all'; // all, radio, tv, news, official

    console.log('Channel Groups API called with filter:', filterType);

    // Base query to get groupname, channel, channelgroup counts
    let whereCondition = sql`1=1`;
    
    // Add filter based on type
    if (filterType === 'radio') {
      whereCondition = sql`LOWER(${mentionsClassify.groupname}) LIKE '%radio%'`;
    } else if (filterType === 'tv') {
      whereCondition = sql`LOWER(${mentionsClassify.groupname}) LIKE '%tv%'`;
    } else if (filterType === 'news') {
      whereCondition = sql`(LOWER(${mentionsClassify.groupname}) LIKE '%berita%' OR LOWER(${mentionsClassify.groupname}) LIKE '%news%')`;
    } else if (filterType === 'official') {
      whereCondition = sql`LOWER(${mentionsClassify.groupname}) LIKE '%official%'`;
    }

    // Query to get the channelgroup data as requested
    const channelGroupData = await getDb()
      .select({
        groupname: mentionsClassify.groupname,
        channel: mentionsClassify.channel,
        channelgroup: mentionsClassify.channelgroup,
        count: count()
      })
      .from(mentionsClassify)
      .where(whereCondition)
      .groupBy(mentionsClassify.groupname, mentionsClassify.channel, mentionsClassify.channelgroup)
      .orderBy(mentionsClassify.channelgroup, desc(count()));

    // Get summary statistics
    const summary = await getDb()
      .select({
        totalRecords: count(),
        uniqueGroups: sql`COUNT(DISTINCT ${mentionsClassify.groupname})`.as('uniqueGroups'),
        uniqueChannels: sql`COUNT(DISTINCT ${mentionsClassify.channel})`.as('uniqueChannels'),
        uniqueChannelGroups: sql`COUNT(DISTINCT ${mentionsClassify.channelgroup})`.as('uniqueChannelGroups')
      })
      .from(mentionsClassify)
      .where(whereCondition);

    // Process data to group by channel groups
    const processedData = {};
    
    channelGroupData.forEach(row => {
      const channelGroup = row.channelgroup || 'Unassigned';
      
      if (!processedData[channelGroup]) {
        processedData[channelGroup] = {
          channelGroup,
          totalMentions: 0,
          channels: []
        };
      }
      
      processedData[channelGroup].totalMentions += Number(row.count);
      processedData[channelGroup].channels.push({
        groupname: row.groupname,
        channel: row.channel,
        count: Number(row.count)
      });
    });

    // Sort channel groups by total mentions
    const sortedChannelGroups = Object.values(processedData)
      .sort((a, b) => b.totalMentions - a.totalMentions);

    // Also provide raw data for the SQL query format you requested
    const sqlFormatData = channelGroupData.map(row => ({
      groupname: row.groupname,
      channel: row.channel,
      channelgroup: row.channelgroup,
      count: Number(row.count)
    }));

    const response = {
      meta: {
        filterType,
        timestamp: new Date().toISOString(),
        summary: {
          totalRecords: Number(summary[0]?.totalRecords || 0),
          uniqueGroups: Number(summary[0]?.uniqueGroups || 0),
          uniqueChannels: Number(summary[0]?.uniqueChannels || 0),
          uniqueChannelGroups: Number(summary[0]?.uniqueChannelGroups || 0)
        }
      },
      data: {
        // Organized by channel group
        byChannelGroup: sortedChannelGroups,
        
        // Raw SQL format as requested: SELECT groupname, channel, channelgroup, count(*)
        sqlFormat: sqlFormatData
      }
    };

    console.log(`Channel Groups API: Found ${sqlFormatData.length} unique combinations`);
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('Channel Groups API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch channel group data', 
        details: error.message,
        sqlQuery: 'SELECT groupname, channel, channelgroup, count(*) FROM mentions_classify GROUP BY groupname, channel, channelgroup ORDER BY channelgroup'
      },
      { status: 500 }
    );
  }
}
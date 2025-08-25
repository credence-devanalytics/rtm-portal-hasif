// app/api/public-mentions/route.js - API for public mentions data

import { db } from '../../../index';
import { mentionsClassifyPublic } from '@/lib/schema';
import { desc, gte, and, sql, count, sum, avg } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Fallback function to use local JSON data when database is unavailable
async function getLocalData() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'moh.json');
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Transform the local JSON data to match the expected schema
    return jsonData.map(item => ({
      id: item['1'] || Math.random(),
      author: item.Author,
      sentiment: item['Auto Sentiment'] || 'neutral',
      topic: item.Category || 'General',
      content: item['Mention Snippet'] || item.Post,
      type: item['Social Media Platform'] || 'unknown',
      inserttime: item.Date ? new Date(item.Date).toISOString() : new Date().toISOString(),
      reach: parseInt(item.Reach) || 0,
      likecount: parseInt(item['Like Count']) || 0,
      sharecount: parseInt(item['Share Count']) || 0,
      commentcount: parseInt(item['Comment Count']) || 0,
      engagementrate: parseFloat(item['Engagement Rate']) || 0,
      confidence: 0.8, // Default confidence for local data
      totalTokens: 100, // Default token count
      url: item.URL
    }));
  } catch (error) {
    console.error('Failed to load local data:', error);
    return [];
  }
}

export async function GET(request) {
  try {
    console.log('🔗 Database URL check:', process.env.DATABASE_URL ? 'Connected' : 'Not connected');
    console.log('🔗 Database URL prefix:', process.env.DATABASE_URL?.substring(0, 20) + '...');
    
    let usingLocalData = false;
    
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const platform = searchParams.get('platform');
    const sentiment = searchParams.get('sentiment');
    const topic = searchParams.get('topic');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10000');
    const offset = (page - 1) * limit;
    
    // Calculate date filter
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    console.log('📊 API Filter Debug:');
    console.log('   Days requested:', days);
    console.log('   Cutoff date:', cutoffDate.toISOString());
    console.log('   Platform filter:', platform || 'all');
    console.log('   Sentiment filter:', sentiment || 'all');
    console.log('   Topic filter:', topic || 'all');
    console.log('   Pagination:', { page, limit, offset });
    
    let mentions = [];
    let metrics = {};
    let sentimentBreakdown = [];
    let topicDistribution = [];
    let platformDistribution = [];
    let dailySentimentTrends = [];
    let confidenceDistribution = [];
    let topMentions = [];
    let uniqueTopics = [];
    let totalCount = { count: 0 };
    
    try {
      // Try to connect to database first
      console.log('🧪 Testing database connection...');
      const [totalInDB] = await db.select({ count: count() }).from(mentionsClassifyPublic);
      console.log('   Total records in database:', totalInDB.count);
      
      // If we get here, database is working - proceed with normal database queries
      // Base where conditions
      let whereConditions = [
        gte(mentionsClassifyPublic.inserttime, cutoffDate.toISOString())
      ];
      
      if (platform && platform !== 'all') {
        whereConditions.push(
          sql`LOWER(${mentionsClassifyPublic.type}) LIKE ${`%${platform.toLowerCase()}%`}`
        );
      }
      
      if (sentiment && sentiment !== 'all') {
        whereConditions.push(
          sql`LOWER(${mentionsClassifyPublic.sentiment}) = ${sentiment.toLowerCase()}`
        );
      }
      
      if (topic && topic !== 'all') {
        whereConditions.push(
          sql`LOWER(${mentionsClassifyPublic.topic}) LIKE ${`%${topic.toLowerCase()}%`}`
        );
      }
      
      // Get mentions data with pagination
      mentions = await db
        .select()
        .from(mentionsClassifyPublic)
        .where(and(...whereConditions))
        .orderBy(desc(mentionsClassifyPublic.inserttime))
        .limit(limit)
        .offset(offset);

      // Get total count for pagination info
      [totalCount] = await db
        .select({ count: count() })
        .from(mentionsClassifyPublic)
        .where(and(...whereConditions));
      
      // Get aggregated metrics
      [metrics] = await db
        .select({
          totalMentions: count(),
          totalReach: sum(mentionsClassifyPublic.reach),
          totalInteractions: sql`SUM(COALESCE(${mentionsClassifyPublic.likecount}, 0) + COALESCE(${mentionsClassifyPublic.sharecount}, 0) + COALESCE(${mentionsClassifyPublic.commentcount}, 0))`,
          avgEngagement: avg(mentionsClassifyPublic.engagementrate),
          avgConfidence: avg(mentionsClassifyPublic.confidence),
          totalTokens: sum(mentionsClassifyPublic.totalTokens)
        })
        .from(mentionsClassifyPublic)
        .where(and(...whereConditions));
      
      // Additional database queries would go here...
      
    } catch (dbError) {
      console.log('❌ Database connection failed, switching to local data:', dbError.message);
      usingLocalData = true;
      
      // Load and process local data
      const localData = await getLocalData();
      console.log('📁 Loaded local data records:', localData.length);
      
      // Apply date filter
      const filteredData = localData.filter(item => {
        const itemDate = new Date(item.inserttime);
        return itemDate >= cutoffDate;
      });
      
      // Apply additional filters
      let processedData = filteredData;
      
      if (platform && platform !== 'all') {
        processedData = processedData.filter(item => 
          item.type?.toLowerCase().includes(platform.toLowerCase())
        );
      }
      
      if (sentiment && sentiment !== 'all') {
        processedData = processedData.filter(item => 
          item.sentiment?.toLowerCase() === sentiment.toLowerCase()
        );
      }
      
      if (topic && topic !== 'all') {
        processedData = processedData.filter(item => 
          item.topic?.toLowerCase().includes(topic.toLowerCase())
        );
      }
      
      // Sort by date (newest first) and apply pagination
      processedData.sort((a, b) => new Date(b.inserttime) - new Date(a.inserttime));
      mentions = processedData.slice(offset, offset + limit);
      totalCount = { count: processedData.length };
      
      // Calculate metrics from local data
      metrics = {
        totalMentions: processedData.length,
        totalReach: processedData.reduce((sum, item) => sum + (item.reach || 0), 0),
        totalInteractions: processedData.reduce((sum, item) => 
          sum + (item.likecount || 0) + (item.sharecount || 0) + (item.commentcount || 0), 0),
        avgEngagement: processedData.reduce((sum, item) => sum + (item.engagementrate || 0), 0) / processedData.length,
        avgConfidence: processedData.reduce((sum, item) => sum + (item.confidence || 0), 0) / processedData.length,
        totalTokens: processedData.reduce((sum, item) => sum + (item.totalTokens || 0), 0)
      };
      
      // Calculate sentiment breakdown
      const sentimentGroups = {};
      processedData.forEach(item => {
        const sent = item.sentiment || 'neutral';
        if (!sentimentGroups[sent]) {
          sentimentGroups[sent] = { count: 0, totalConfidence: 0 };
        }
        sentimentGroups[sent].count++;
        sentimentGroups[sent].totalConfidence += item.confidence || 0;
      });
      
      sentimentBreakdown = Object.entries(sentimentGroups).map(([sentiment, data]) => ({
        sentiment,
        count: data.count,
        avgConfidence: data.totalConfidence / data.count
      }));
      
      // Calculate other distributions similarly...
      // Topic distribution
      const topicGroups = {};
      processedData.forEach(item => {
        const topicKey = item.topic || 'General';
        if (!topicGroups[topicKey]) {
          topicGroups[topicKey] = { count: 0, totalConfidence: 0, totalReach: 0 };
        }
        topicGroups[topicKey].count++;
        topicGroups[topicKey].totalConfidence += item.confidence || 0;
        topicGroups[topicKey].totalReach += item.reach || 0;
      });
      
      topicDistribution = Object.entries(topicGroups).map(([topic, data]) => ({
        topic,
        count: data.count,
        avgConfidence: data.totalConfidence / data.count,
        totalReach: data.totalReach
      })).sort((a, b) => b.count - a.count);
      
      // Platform distribution
      const platformGroups = {};
      processedData.forEach(item => {
        const platformKey = item.type || 'unknown';
        if (!platformGroups[platformKey]) {
          platformGroups[platformKey] = { count: 0, totalReach: 0 };
        }
        platformGroups[platformKey].count++;
        platformGroups[platformKey].totalReach += item.reach || 0;
      });
      
      platformDistribution = Object.entries(platformGroups).map(([platform, data]) => ({
        platform,
        count: data.count,
        totalReach: data.totalReach
      })).sort((a, b) => b.count - a.count);
      
      // Get unique topics
      uniqueTopics = [...new Set(processedData.map(item => item.topic).filter(Boolean))];
      
      // Get top mentions by reach
      topMentions = processedData
        .sort((a, b) => (b.reach || 0) - (a.reach || 0))
        .slice(0, 10);
      
      // Create daily trends (simplified)
      const dateGroups = {};
      processedData.forEach(item => {
        const date = new Date(item.inserttime).toISOString().split('T')[0];
        if (!dateGroups[date]) {
          dateGroups[date] = { 
            total: 0, positive: 0, negative: 0, neutral: 0, 
            totalConfidence: 0, totalReach: 0, totalInteractions: 0 
          };
        }
        dateGroups[date].total++;
        dateGroups[date][item.sentiment?.toLowerCase() || 'neutral']++;
        dateGroups[date].totalConfidence += item.confidence || 0;
        dateGroups[date].totalReach += item.reach || 0;
        dateGroups[date].totalInteractions += (item.likecount || 0) + (item.sharecount || 0) + (item.commentcount || 0);
      });
      
      dailySentimentTrends = Object.entries(dateGroups).map(([date, data]) => ({
        date,
        count: data.total,
        positive: data.positive,
        negative: data.negative,
        neutral: data.neutral,
        avgConfidence: data.totalConfidence / data.total,
        totalReach: data.totalReach,
        totalInteractions: data.totalInteractions
      })).sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Confidence distribution
      const confRanges = {
        'Very High (0.9-1.0)': 0,
        'High (0.8-0.9)': 0,
        'Medium (0.7-0.8)': 0,
        'Low (0.6-0.7)': 0,
        'Very Low (<0.6)': 0
      };
      
      processedData.forEach(item => {
        const conf = item.confidence || 0;
        if (conf >= 0.9) confRanges['Very High (0.9-1.0)']++;
        else if (conf >= 0.8) confRanges['High (0.8-0.9)']++;
        else if (conf >= 0.7) confRanges['Medium (0.7-0.8)']++;
        else if (conf >= 0.6) confRanges['Low (0.6-0.7)']++;
        else confRanges['Very Low (<0.6)']++;
      });
      
      confidenceDistribution = Object.entries(confRanges).map(([range, count]) => ({
        range,
        count
      })).filter(item => item.count > 0);
    }
    
    const response = {
      // Raw data for detailed analysis
      mentions,
      
      // Aggregated metrics
      metrics: {
        totalMentions: parseInt(metrics.totalMentions) || 0,
        totalReach: parseInt(metrics.totalReach) || 0,
        totalInteractions: parseInt(metrics.totalInteractions) || 0,
        avgEngagement: parseFloat(metrics.avgEngagement) || 0,
        avgConfidence: parseFloat(metrics.avgConfidence) || 0,
        totalTokens: parseInt(metrics.totalTokens) || 0
      },
      
      // Sentiment data
      sentiment: {
        breakdown: sentimentBreakdown.map(s => ({
          sentiment: s.sentiment || 'unknown',
          count: parseInt(s.count),
          avgConfidence: parseFloat(s.avgConfidence) || 0
        })),
        trend: dailySentimentTrends.map(d => ({
          date: d.date,
          positive: parseInt(d.positive),
          negative: parseInt(d.negative),
          neutral: parseInt(d.neutral),
          avgConfidence: parseFloat(d.avgConfidence) || 0
        }))
      },
      
      // Topic data
      topics: {
        distribution: topicDistribution.map(t => ({
          topic: t.topic,
          count: parseInt(t.count),
          avgConfidence: parseFloat(t.avgConfidence) || 0,
          totalReach: parseInt(t.totalReach) || 0
        })),
        uniqueTopics: uniqueTopics.map ? uniqueTopics.map(t => t.topic || t).filter(Boolean) : uniqueTopics.filter(Boolean)
      },
      
      // Platform data
      platforms: platformDistribution.map(p => ({
        platform: p.platform,
        count: parseInt(p.count),
        totalReach: parseInt(p.totalReach) || 0
      })),
      
      // Confidence distribution
      confidence: {
        distribution: confidenceDistribution.map(c => ({
          range: c.range || c.confidenceRange,
          count: parseInt(c.count)
        }))
      },
      
      // Time series data
      timeSeries: dailySentimentTrends.map(d => ({
        date: d.date,
        mentions: parseInt(d.count),
        reach: parseInt(d.totalReach) || 0,
        interactions: parseInt(d.totalInteractions) || 0,
        avgConfidence: parseFloat(d.avgConfidence) || 0
      })),
      
      // Top performing content
      topContent: topMentions,
      
      // Metadata
      meta: {
        queryDate: new Date().toISOString(),
        dateRange: days,
        dataSource: usingLocalData ? 'local_file' : 'database',
        filters: {
          platform: platform || 'all',
          sentiment: sentiment || 'all',
          topic: topic || 'all'
        },
        pagination: {
          page,
          limit,
          offset,
          total: parseInt(totalCount.count),
          totalPages: Math.ceil(parseInt(totalCount.count) / limit),
          hasNextPage: page * limit < parseInt(totalCount.count),
          hasPrevPage: page > 1
        }
      }
    };
    
    console.log(`Public Mentions API: ${usingLocalData ? 'Using local data' : 'Using database'} - Processed ${mentions.length} mentions for filters:`, {
      days,
      platform: platform || 'all',
      sentiment: sentiment || 'all', 
      topic: topic || 'all',
      totalInDB: parseInt(totalCount.count),
      currentPage: page,
      totalPages: Math.ceil(parseInt(totalCount.count) / limit),
      pageSize: limit,
      returnedRecords: mentions.length,
      dateRange: `${cutoffDate.toISOString()} to now`,
      responseSizeKB: Math.round(JSON.stringify(mentions).length / 1024),
      dataSource: usingLocalData ? 'LOCAL_JSON' : 'DATABASE'
    });
    
    // Check if response is too large
    const responseSize = JSON.stringify(mentions).length;
    if (responseSize > 50 * 1024 * 1024) { // 50MB
      console.warn('⚠️ Large response detected:', responseSize / (1024 * 1024), 'MB');
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Public Mentions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public mentions data', details: error.message },
      { status: 500 }
    );
  }
}

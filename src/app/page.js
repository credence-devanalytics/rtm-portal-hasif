"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  MessageSquare, 
  ThumbsUp, 
  Eye, 
  Users, 
  Globe, 
  Calendar,
  Download,
  Filter,
  Hash,
  Star,
  TrendingDown
} from 'lucide-react';

const RTMDashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('30');
  const [selectedUnit, setSelectedUnit] = useState('all');

  // Mock data for demonstration - replace with actual data loading
  // Load data from CSV file
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Read CSV file from public directory
        const response = await fetch('/data/combined_classify_mentions.csv');
        if (!response.ok) {
          throw new Error('Failed to fetch CSV file');
        }
        
        const csvText = await response.text();
        
        // Parse CSV using Papa Parse
        const Papa = await import('papaparse');
        const results = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          delimitersToGuess: [',', '\t', '|', ';']
        });
        
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }
        
        // Transform CSV data to match our component structure
        const transformedData = results.data.map((row, index) => {
          // Parse date from insertTime or insertDate
          let date = new Date();
          if (row.insertTime) {
            date = new Date(row.insertTime);
          } else if (row.insertDate) {
            date = new Date(row.insertDate);
          }
          
          // Determine platform from type field
          let platform = 'other';
          if (row.type) {
            const type = row.type.toLowerCase();
            if (type.includes('facebook')) platform = 'facebook';
            else if (type.includes('instagram')) platform = 'instagram';
            else if (type.includes('twitter')) platform = 'twitter';
            else if (type.includes('tiktok')) platform = 'tiktok';
            else if (type.includes('youtube')) platform = 'youtube';
          }
          
          // Determine unit from groupName or author
          let unit = 'Other';
          if (row.groupName) {
            const groupName = row.groupName.toLowerCase();
            if (groupName.includes('radio')) unit = 'Radio';
            else if (groupName.includes('tv')) unit = 'TV';
            else if (groupName.includes('berita') || groupName.includes('news')) unit = 'Berita';
          }
          
          // Parse sentiment
          let sentiment = 'neutral';
          if (row.sentiment || row.autoSentiment) {
            const sentimentValue = (row.sentiment || row.autoSentiment || '').toLowerCase();
            if (sentimentValue.includes('positive')) sentiment = 'positive';
            else if (sentimentValue.includes('negative')) sentiment = 'negative';
            else sentiment = 'neutral';
          }
          
          // Parse engagement metrics
          const likeCount = parseInt(row.likeCount) || parseInt(row.favoriteCount) || parseInt(row.diggCount) || 0;
          const shareCount = parseInt(row.shareCount) || parseInt(row.retweetCount) || 0;
          const commentCount = parseInt(row.commentCount) || parseInt(row.replyCount) || 0;
          const viewCount = parseInt(row.viewCount) || parseInt(row.playCount) || 0;
          const reach = parseInt(row.reach) || parseInt(row.sourceReach) || viewCount || 1000;
          const followerCount = parseInt(row.followersCount) || parseInt(row.authorFollowerCount) || 0;
          
          return {
            id: row.id || index,
            author: row.author || row.from || row.influencer || `User${index}`,
            sentiment,
            category: row.Topic || 'General',
            date: date.toISOString().split('T')[0],
            platform,
            unit,
            keywords: (row.keywords || row.keywordNames || '').toString(),
            likeCount,
            shareCount,
            commentCount,
            interactions: likeCount + shareCount + commentCount,
            reach,
            engagementRate: parseFloat(row.engagementRate) || ((likeCount + shareCount + commentCount) / Math.max(reach, 1) * 100),
            location: row.locations || 'Malaysia',
            influenceScore: parseInt(row.influenceScore) || 0,
            followerCount,
            mentionSnippet: row.mention || row.fullMention || row.title || 'No content available',
            isInfluencer: (row.influencer && row.influencer !== row.author) || followerCount > 10000,
            originalData: row // Keep original data for debugging
          };
        }).filter(item => item.date && !isNaN(new Date(item.date))); // Filter out invalid dates
        
        console.log(`Loaded ${transformedData.length} records from CSV`);
        console.log('Sample transformed data:', transformedData.slice(0, 3));
        
        setData(transformedData);
        setFilteredData(transformedData);
      } catch (error) {
        console.error('Error loading CSV data:', error);
        // Fallback to empty data or show error message
        setData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = data;
    
    // Date range filter
    const daysAgo = parseInt(selectedDateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    filtered = filtered.filter(item => new Date(item.date) >= cutoffDate);
    
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(item => item.platform === selectedPlatform);
    }
    
    if (selectedUnit !== 'all') {
      filtered = filtered.filter(item => item.unit === selectedUnit);
    }
    
    setFilteredData(filtered);
  }, [selectedPlatform, selectedDateRange, selectedUnit, data]);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading RTM Social Media Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate key metrics
  const totalMentions = filteredData.length;
  const totalEngagements = filteredData.reduce((sum, item) => sum + item.likeCount + item.shareCount + item.commentCount, 0);
  const totalReach = filteredData.reduce((sum, item) => sum + item.reach, 0);
  const totalInfluencers = filteredData.filter(item => item.isInfluencer).length;
  
  const positiveMentions = filteredData.filter(d => d.sentiment === 'positive').length;
  const negativeMentions = filteredData.filter(d => d.sentiment === 'negative').length;
  const neutralMentions = filteredData.filter(d => d.sentiment === 'neutral').length;

  // Platform breakdown over time
  const platformTimeData = filteredData.reduce((acc, item) => {
    const dateKey = item.date;
    if (!acc[dateKey]) {
      acc[dateKey] = { date: dateKey, facebook: 0, instagram: 0, twitter: 0, tiktok: 0 };
    }
    acc[dateKey][item.platform] = (acc[dateKey][item.platform] || 0) + 1;
    return acc;
  }, {});

  const mentionsOverTime = Object.values(platformTimeData)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30);

  // Sentiment trend over time
  const sentimentTimeData = filteredData.reduce((acc, item) => {
    const dateKey = item.date;
    if (!acc[dateKey]) {
      acc[dateKey] = { date: dateKey, positive: 0, negative: 0, neutral: 0 };
    }
    acc[dateKey][item.sentiment] = (acc[dateKey][item.sentiment] || 0) + 1;
    return acc;
  }, {});

  const sentimentTrend = Object.values(sentimentTimeData)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30);

  // Top trending keywords
  const keywordCounts = filteredData.reduce((acc, item) => {
    const keywords = item.keywords.split(',').map(k => k.trim());
    keywords.forEach(keyword => {
      acc[keyword] = (acc[keyword] || 0) + 1;
    });
    return acc;
  }, {});

  const trendingKeywords = Object.entries(keywordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }));

  // Top influencers
  const topInfluencers = filteredData
    .filter(item => item.isInfluencer)
    .reduce((acc, item) => {
      if (!acc[item.author]) {
        acc[item.author] = {
          author: item.author,
          platform: item.platform,
          totalEngagement: 0,
          mentions: 0,
          followers: item.followerCount,
          influenceScore: item.influenceScore
        };
      }
      acc[item.author].totalEngagement += item.likeCount + item.shareCount + item.commentCount;
      acc[item.author].mentions += 1;
      return acc;
    }, {});

  const topInfluencersList = Object.values(topInfluencers)
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
    .slice(0, 8);

  // Utility functions
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const getPlatformColor = (platform) => {
    const colors = {
      facebook: '#1877F2',
      instagram: '#E4405F',
      twitter: '#1DA1F2',
      tiktok: '#000000'
    };
    return colors[platform] || '#6B7280';
  };

  const exportData = () => {
    // Mock export functionality
    alert('Export functionality would be implemented here (CSV/PDF/PNG)');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RTM Social Media Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring across Radio, TV, and Berita social channels
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap items-center">
          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-36">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedUnit} onValueChange={setSelectedUnit}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Units</SelectItem>
              <SelectItem value="Radio">Radio</SelectItem>
              <SelectItem value="TV">TV</SelectItem>
              <SelectItem value="Berita">Berita</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Mentions</CardTitle>
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{formatNumber(totalMentions)}</div>
            <p className="text-xs text-blue-700 mt-1">Across all platforms</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Total Engagements</CardTitle>
            <ThumbsUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{formatNumber(totalEngagements)}</div>
            <p className="text-xs text-green-700 mt-1">Likes, shares, comments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Sentiment Score</CardTitle>
            <div className="flex gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 text-sm">
              <span className="text-green-600 font-bold">+{positiveMentions}</span>
              <span className="text-red-600 font-bold">-{negativeMentions}</span>
              <span className="text-gray-600 font-bold">~{neutralMentions}</span>
            </div>
            <p className="text-xs text-purple-700 mt-1">Positive vs Negative</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Total Reach</CardTitle>
            <Eye className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{formatNumber(totalReach)}</div>
            <p className="text-xs text-orange-700 mt-1">People reached</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-900">Influencers</CardTitle>
            <Star className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-900">{totalInfluencers}</div>
            <p className="text-xs text-indigo-700 mt-1">Key voices identified</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mentions Over Time by Platform */}
        <Card>
          <CardHeader>
            <CardTitle>Mentions Over Time</CardTitle>
            <CardDescription>Daily mentions breakdown by social platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={mentionsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="facebook" 
                  stroke={getPlatformColor('facebook')} 
                  strokeWidth={2}
                  name="Facebook"
                />
                <Line 
                  type="monotone" 
                  dataKey="instagram" 
                  stroke={getPlatformColor('instagram')} 
                  strokeWidth={2}
                  name="Instagram"
                />
                <Line 
                  type="monotone" 
                  dataKey="twitter" 
                  stroke={getPlatformColor('twitter')} 
                  strokeWidth={2}
                  name="Twitter"
                />
                <Line 
                  type="monotone" 
                  dataKey="tiktok" 
                  stroke={getPlatformColor('tiktok')} 
                  strokeWidth={2}
                  name="TikTok"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sentiment Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Breakdown</CardTitle>
            <CardDescription>Daily sentiment analysis across all mentions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={sentimentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="positive"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.8}
                  name="Positive"
                />
                <Area
                  type="monotone"
                  dataKey="neutral"
                  stackId="1"
                  stroke="#6B7280"
                  fill="#6B7280"
                  fillOpacity={0.8}
                  name="Neutral"
                />
                <Area
                  type="monotone"
                  dataKey="negative"
                  stackId="1"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.8}
                  name="Negative"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Keywords and Influencers */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Trending Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Top Trending Topics
            </CardTitle>
            <CardDescription>Most mentioned keywords and hashtags</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trendingKeywords.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <span className="font-medium">#{item.keyword}</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {item.count} mentions
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Influencers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Authors & Influencers
            </CardTitle>
            <CardDescription>Most engaged content creators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topInfluencersList.map((influencer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium">{influencer.author}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {influencer.platform}
                      </Badge>
                      <span>{formatNumber(influencer.followers)} followers</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatNumber(influencer.totalEngagement)}</div>
                    <div className="text-xs text-muted-foreground">{influencer.mentions} posts</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs for Future Implementation */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p className="mb-4">Additional dashboard sections:</p>
            <div className="flex justify-center gap-2 flex-wrap">
              <Badge variant="outline">Platform Analysis</Badge>
              <Badge variant="outline">Content Categories</Badge>
              <Badge variant="outline">Geographic Analysis</Badge>
              <Badge variant="outline">Detailed Reports</Badge>
              <Badge variant="outline">Crisis Monitoring</Badge>
            </div>
            <p className="text-sm mt-2">Coming in future tabs...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RTMDashboard;
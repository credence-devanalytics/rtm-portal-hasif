"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  AreaChart,
  ScatterChart,
  Scatter
} from 'recharts';
import { TrendingUp, MessageSquare, ThumbsUp, Eye, Users, Globe, Calendar } from 'lucide-react';

const MOHDashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedSentiment, setSelectedSentiment] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/moh.json');
        const jsonData = await response.json();
        
        // Process and clean the data
        const processedData = jsonData.map((item, index) => ({
          id: index,
          author: item.Author || 'Unknown',
          sentiment: item['Auto Sentiment'] || 'neutral',
          category: item.Category || 'Others',
          date: item.Date,
          platform: item['Social Media Platform'] || 'web',
          keywords: item.Keywords || item['Found Keywords'] || '',
          likeCount: parseInt(item['Like Count']) || 0,
          shareCount: parseInt(item['Share Count']) || 0,
          commentCount: parseInt(item['Comment Count']) || 0,
          interactions: parseInt(item.Interactions) || 0,
          reach: parseInt(item.Reach) || 0,
          engagementRate: parseFloat(item['Engagement Rate']) || 0,
          location: item.Locations || 'Unknown',
          influenceScore: parseInt(item['Influence Score']) || 0,
          followerCount: parseInt(item['Followers Count']) || 0,
          mentionSnippet: item['Mention Snippet'] || '',
          post: item.Post || '',
          url: item.URL || '',
          totalReactions: parseInt(item['Total Reactions Count']) || 0,
          from: item.From || '',
          language: item.Languages || '',
          angryCount: parseInt(item['Angry Count']) || 0,
          hahaCount: parseInt(item['Haha Count']) || 0,
          loveCount: parseInt(item['Love Count']) || 0,
          sadCount: parseInt(item['Sad Count']) || 0,
          wowCount: parseInt(item['Wow Count']) || 0
        }));

        setData(processedData);
        setFilteredData(processedData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = data;
    
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(item => item.platform === selectedPlatform);
    }
    
    if (selectedSentiment !== 'all') {
      filtered = filtered.filter(item => item.sentiment === selectedSentiment);
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(item => item.location === selectedLocation);
    }
    
    setFilteredData(filtered);
  }, [selectedPlatform, selectedSentiment, selectedLocation, data]);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading MOH data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Get unique values for filters
  const platforms = [...new Set(data.map(item => item.platform))].filter(Boolean);
  const locations = [...new Set(data.map(item => item.location))].filter(Boolean);

  // Calculate metrics
  const totalMentions = filteredData.length;
  const totalInteractions = filteredData.reduce((sum, item) => sum + item.interactions, 0);
  const totalReach = filteredData.reduce((sum, item) => sum + item.reach, 0);
  const avgEngagement = totalMentions > 0 ? (filteredData.reduce((sum, item) => sum + item.engagementRate, 0) / totalMentions).toFixed(2) : 0;
  const avgInfluence = totalMentions > 0 ? (filteredData.reduce((sum, item) => sum + item.influenceScore, 0) / totalMentions).toFixed(1) : 0;

  // Sentiment distribution
  const sentimentData = [
    { 
      name: 'Positive', 
      value: filteredData.filter(d => d.sentiment === 'positive').length, 
      color: '#10B981' 
    },
    { 
      name: 'Negative', 
      value: filteredData.filter(d => d.sentiment === 'negative').length, 
      color: '#EF4444' 
    },
    { 
      name: 'Neutral', 
      value: filteredData.filter(d => d.sentiment === 'neutral').length, 
      color: '#6B7280' 
    }
  ].filter(item => item.value > 0);

  // Platform distribution
  const platformData = filteredData.reduce((acc, item) => {
    acc[item.platform] = (acc[item.platform] || 0) + 1;
    return acc;
  }, {});

  const platformChartData = Object.entries(platformData).map(([platform, count]) => ({
    platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    mentions: count,
    engagement: filteredData
      .filter(item => item.platform === platform)
      .reduce((sum, item) => sum + item.interactions, 0)
  }));

  // Category distribution
  const categoryData = filteredData.reduce((acc, item) => {
    const category = item.category || 'Others';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData)
    .map(([category, count]) => ({
      category: category.length > 20 ? category.substring(0, 20) + '...' : category,
      mentions: count,
      fullCategory: category
    }))
    .sort((a, b) => b.mentions - a.mentions);

  // Location distribution
  const locationData = filteredData.reduce((acc, item) => {
    acc[item.location] = (acc[item.location] || 0) + 1;
    return acc;
  }, {});

  const locationChartData = Object.entries(locationData).map(([location, count]) => ({
    location,
    mentions: count
  }));

  // Engagement vs Reach scatter data
  const engagementReachData = filteredData
    .filter(item => item.reach > 0 && item.interactions > 0)
    .map(item => ({
      reach: item.reach,
      interactions: item.interactions,
      sentiment: item.sentiment,
      author: item.author
    }));

  // Top influencers
  const topInfluencers = filteredData
    .filter(item => item.influenceScore > 0)
    .sort((a, b) => b.influenceScore - a.influenceScore)
    .slice(0, 10);

  // Date-based engagement (group by date)
  const dateEngagementData = filteredData.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = {
        date,
        interactions: 0,
        reach: 0,
        mentions: 0
      };
    }
    acc[date].interactions += item.interactions;
    acc[date].reach += item.reach;
    acc[date].mentions += 1;
    return acc;
  }, {});

  const timeSeriesData = Object.values(dateEngagementData)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30); // Last 30 data points

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MOH Social Media Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor Ministry of Health mentions across social platforms ({totalMentions} total mentions)
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map(platform => (
                <SelectItem key={platform} value={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiments</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mentions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMentions}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalInteractions)}</div>
            <p className="text-xs text-muted-foreground">Likes, comments, shares</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalReach)}</div>
            <p className="text-xs text-muted-foreground">People reached</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEngagement}%</div>
            <p className="text-xs text-muted-foreground">Engagement rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Influence</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgInfluence}</div>
            <p className="text-xs text-muted-foreground">Influence score</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="sentiment" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="influencers">Top Authors</TabsTrigger>
        </TabsList>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
                <CardDescription>Overall sentiment of MOH mentions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Breakdown</CardTitle>
                <CardDescription>Detailed sentiment metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sentimentData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.value}</div>
                      <div className="text-sm text-muted-foreground">
                        {totalMentions > 0 ? Math.round((item.value / totalMentions) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>Mentions and engagement across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={platformChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="mentions" fill="#3B82F6" name="Mentions" />
                  <Bar yAxisId="right" dataKey="engagement" fill="#10B981" name="Total Interactions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Categories</CardTitle>
              <CardDescription>Distribution of mentions by content category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={150} />
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                  <Bar dataKey="mentions" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Mentions by location/country</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={locationChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="mentions" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Over Time</CardTitle>
                <CardDescription>Daily interactions and reach trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="interactions" 
                      stackId="1" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.6}
                      name="Interactions"
                    />
                    <Area 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="reach" 
                      stackId="2" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.6}
                      name="Reach"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="influencers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Influential Authors</CardTitle>
              <CardDescription>Authors with highest influence scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topInfluencers.slice(0, 8).map((author, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{author.author}</div>
                      <div className="text-sm text-muted-foreground">
                        {author.followerCount > 0 && `${formatNumber(author.followerCount)} followers • `}
                        {author.keywords}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{author.influenceScore}</div>
                      <div className="text-sm text-muted-foreground">influence</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Mentions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Mentions</CardTitle>
          <CardDescription>Latest social media mentions about MOH</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredData.slice(0, 5).map((mention, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getSentimentColor(mention.sentiment)}>
                      {mention.sentiment}
                    </Badge>
                    <Badge variant="outline">{mention.platform}</Badge>
                    <Badge variant="outline">{mention.location}</Badge>
                    <span className="text-sm text-muted-foreground">{mention.date}</span>
                  </div>
                  <div className="font-medium">{mention.author || mention.from}</div>
                  <div className="text-sm">
                    {mention.mentionSnippet || mention.post}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Keywords: {mention.keywords}
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>👍 {mention.likeCount}</span>
                    <span>💬 {mention.commentCount}</span>
                    <span>🔄 {mention.shareCount}</span>
                    <span>👀 {formatNumber(mention.reach)}</span>
                    {mention.engagementRate > 0 && <span>📊 {mention.engagementRate.toFixed(2)}%</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MOHDashboard;
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Trophy,
  TrendingUp,
  ExternalLink,
  Monitor,
  MapPin,
  UserCheck,
  Calendar,
  Eye,
  MousePointer,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

const PortalBeritaPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [audienceData, setAudienceData] = useState(null);
  const [ageData, setAgeData] = useState(null);
  const [genderData, setGenderData] = useState(null);
  const [hourlyGenderData, setHourlyGenderData] = useState(null);
  const [hourlyGenderDataPM, setHourlyGenderDataPM] = useState(null);
  const [hourlyGenderDataCombined, setHourlyGenderDataCombined] =
    useState(null);
  const [regionData, setRegionData] = useState(null);
  const [audienceDistributionData, setAudienceDistributionData] =
    useState(null);
  const [popularPagesData, setPopularPagesData] = useState(null);
  const [popularPagesLimit, setPopularPagesLimit] = useState(10);
  const [trafficSourceData, setTrafficSourceData] = useState(null);
  const [trafficSourceLimit, setTrafficSourceLimit] = useState(5);

  // Fetch dashboard summary data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log("Fetching Portal Berita dashboard data...");
        const response = await fetch("/api/pb-dashboard-summary");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Dashboard API Response:", data);
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch audience data for charts (monthly view)
  useEffect(() => {
    const fetchAudienceData = async () => {
      try {
        const response = await fetch("/api/pb-audience-monthly");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Audience API Response:", data);
        setAudienceData(data);
      } catch (error) {
        console.error("Error fetching audience data:", error);
      }
    };

    fetchAudienceData();
  }, []);

  // Fetch age demographics data
  useEffect(() => {
    const fetchAgeData = async () => {
      try {
        const response = await fetch("/api/pb-age-demographics");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Age Demographics API Response:", data);
        setAgeData(data);
      } catch (error) {
        console.error("Error fetching age data:", error);
      }
    };

    fetchAgeData();
  }, []);

  // Fetch gender distribution data
  useEffect(() => {
    const fetchGenderData = async () => {
      try {
        const response = await fetch("/api/pb-gender-distribution");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Gender Distribution API Response:", data);
        setGenderData(data);
      } catch (error) {
        console.error("Error fetching gender data:", error);
      }
    };

    fetchGenderData();
  }, []);

  // Fetch hourly gender distribution data
  useEffect(() => {
    const fetchHourlyGenderData = async () => {
      try {
        const response = await fetch("/api/pb-gender-distribution?view=hourly");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Hourly Gender Distribution API Response:", data);
        setHourlyGenderData(data);
      } catch (error) {
        console.error("Error fetching hourly gender data:", error);
      }
    };

    fetchHourlyGenderData();
  }, []);

  // Fetch hourly gender distribution data (PM)
  useEffect(() => {
    const fetchHourlyGenderDataPM = async () => {
      try {
        const response = await fetch(
          "/api/pb-gender-distribution?view=hourly-pm"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Hourly Gender Distribution PM API Response:", data);
        setHourlyGenderDataPM(data);
      } catch (error) {
        console.error("Error fetching hourly gender PM data:", error);
      }
    };

    fetchHourlyGenderDataPM();
  }, []);

  // Fetch regional data
  useEffect(() => {
    const fetchRegionData = async () => {
      try {
        const response = await fetch("/api/pb-regional-analysis");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Regional Analysis API Response:", data);
        setRegionData(data);
      } catch (error) {
        console.error("Error fetching region data:", error);
      }
    };

    fetchRegionData();
  }, []);

  // Fetch audience distribution data
  useEffect(() => {
    const fetchAudienceDistributionData = async () => {
      try {
        const response = await fetch("/api/pb-audience-distribution");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Audience Distribution API Response:", data);
        setAudienceDistributionData(data);
      } catch (error) {
        console.error("Error fetching audience distribution data:", error);
      }
    };

    fetchAudienceDistributionData();
  }, []);

  // Fetch popular pages data
  useEffect(() => {
    const fetchPopularPagesData = async () => {
      try {
        const response = await fetch(
          `/api/pb-popular-pages?limit=${popularPagesLimit}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Popular Pages API Response:", data);
        setPopularPagesData(data);
      } catch (error) {
        console.error("Error fetching popular pages data:", error);
      }
    };

    fetchPopularPagesData();
  }, [popularPagesLimit]);

  // Fetch traffic source data
  useEffect(() => {
    const fetchTrafficSourceData = async () => {
      try {
        console.log(
          "Fetching traffic source data with limit:",
          trafficSourceLimit
        );
        const response = await fetch(
          `/api/pb-user-source-analysis?limit=${trafficSourceLimit}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Traffic Source API Response:", data);
        console.log("Traffic Source Limit State:", trafficSourceLimit);
        setTrafficSourceData(data);
      } catch (error) {
        console.error("Error fetching traffic source data:", error);
      }
    };

    fetchTrafficSourceData();
  }, [trafficSourceLimit]);

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    if (!dashboardData?.success || !dashboardData?.data) {
      return {
        hasData: false,
        totalAudience: 0,
        topRegion: { name: "Loading...", users: 0 },
        topTrafficSource: { name: "Loading...", users: 0 },
        topExternalSource: { name: "Loading...", users: 0 },
      };
    }

    const { data } = dashboardData;
    return {
      hasData: data.summary.hasData,
      totalAudience: data.totalAudience,
      formattedTotalAudience: data.summary.formattedTotalAudience,
      topRegion: data.topRegion,
      topTrafficSource: data.topTrafficSource,
      topExternalSource: data.topExternalSource,
      metrics: data.summary.metrics,
    };
  }, [dashboardData]);

  // Process audience chart data (monthly)
  const audienceChartData = useMemo(() => {
    if (!audienceData?.success || !audienceData?.data?.chartData) {
      return [];
    }

    return audienceData.data.chartData.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      }),
      totalUsers: item.totalUsers,
      newUsers: item.newUsers,
      returningUsers: item.returningUsers || item.totalUsers - item.newUsers,
      fullDate: item.date,
    }));
  }, [audienceData]);

  // Process age demographics chart data
  const ageChartData = useMemo(() => {
    if (!ageData?.success || !ageData?.data?.chartData) {
      return [];
    }

    return ageData.data.chartData
      .filter(
        (item) =>
          item.ageBracket &&
          item.ageBracket.toLowerCase() !== "unknown" &&
          item.ageBracket.toLowerCase() !== "n/a" &&
          item.activeUsers > 0
      )
      .map((item) => ({
        ageBracket: item.ageBracket,
        activeUsers: item.activeUsers,
        percentage: item.percentage,
      }))
      .sort((a, b) => {
        // Sort age brackets in logical order
        const ageOrder = {
          "18-24": 1,
          "25-34": 2,
          "35-44": 3,
          "45-54": 4,
          "55-64": 5,
          "65+": 6,
        };
        return (
          (ageOrder[a.ageBracket] || 999) - (ageOrder[b.ageBracket] || 999)
        );
      });
  }, [ageData]);

  // Process gender distribution chart data
  const genderChartData = useMemo(() => {
    if (!genderData?.success || !genderData?.data?.chartData) {
      return [];
    }

    const colors = { female: "#ff69b4", male: "#4169e1", other: "#32cd32" };

    return genderData.data.chartData
      .filter(
        (item) =>
          item.gender &&
          item.gender.toLowerCase() !== "unknown" &&
          item.gender.toLowerCase() !== "n/a" &&
          item.activeUsers > 0
      )
      .map((item) => ({
        gender: item.gender,
        activeUsers: item.activeUsers,
        percentage: item.percentage,
        fill: colors[item.gender] || "#888888",
      }));
  }, [genderData]);

  // Process hourly gender chart data (12 AM - 11 AM)
  const hourlyGenderChartData = useMemo(() => {
    console.log("Processing hourly gender data:", hourlyGenderData);

    if (!hourlyGenderData?.success || !hourlyGenderData?.data?.chartData) {
      console.log("No hourly gender data available");
      return [];
    }

    console.log("Hourly chart data:", hourlyGenderData.data.chartData);
    return hourlyGenderData.data.chartData;
  }, [hourlyGenderData]);

  // Process hourly gender chart data (12 PM - 11 PM)
  const hourlyGenderChartDataPM = useMemo(() => {
    console.log("Processing hourly gender PM data:", hourlyGenderDataPM);

    if (!hourlyGenderDataPM?.success || !hourlyGenderDataPM?.data?.chartData) {
      console.log("No hourly gender PM data available");
      return [];
    }

    console.log("Hourly PM chart data:", hourlyGenderDataPM.data.chartData);
    return hourlyGenderDataPM.data.chartData;
  }, [hourlyGenderDataPM]);

  // Process combined hourly gender chart data (24 hours: 12 AM - 11 PM)
  const hourlyGenderChartDataCombined = useMemo(() => {
    console.log("Processing combined hourly gender data");

    if (!hourlyGenderData?.success || !hourlyGenderDataPM?.success) {
      console.log("Missing AM or PM data for combined chart");
      return [];
    }

    const amData = hourlyGenderData.data?.chartData || [];
    const pmData = hourlyGenderDataPM.data?.chartData || [];

    if (amData.length === 0 || pmData.length === 0) {
      console.log("No data available for combined chart");
      return [];
    }

    // Combine AM (0-11) and PM (12-23) data
    const combinedData = [...amData, ...pmData];
    console.log("Combined hourly chart data:", combinedData);
    return combinedData;
  }, [hourlyGenderData, hourlyGenderDataPM]);

  // Process regional chart data
  const regionChartData = useMemo(() => {
    if (!regionData?.success || !regionData?.data?.chartData) {
      return [];
    }

    return regionData.data.chartData
      .slice(0, 10) // Top 10 regions
      .map((item) => {
        // Clean up region names
        let cleanRegionName = item.region;
        if (cleanRegionName === "Federal Territory of Kuala Lumpur") {
          cleanRegionName = "Kuala Lumpur";
        } else if (cleanRegionName === "Labuan Federal Territory") {
          cleanRegionName = "Labuan";
        }

        return {
          region:
            cleanRegionName.length > 15
              ? cleanRegionName.substring(0, 15) + "..."
              : cleanRegionName,
          fullRegion: cleanRegionName,
          originalRegion: item.region,
          activeUsers: item.activeUsers,
          percentage: item.percentage,
        };
      });
  }, [regionData]);

  // Process audience distribution chart data
  const audienceDistributionChartData = useMemo(() => {
    if (
      !audienceDistributionData?.success ||
      !audienceDistributionData?.data?.chartData
    ) {
      return [];
    }

    return audienceDistributionData.data.chartData.map((item) => ({
      audienceName: item.audienceName,
      totalUsers: item.totalUsers,
      percentage: item.percentage,
      fill: item.fill,
    }));
  }, [audienceDistributionData]);

  // Process popular pages table data
  const popularPagesTableData = useMemo(() => {
    if (!popularPagesData?.success || !popularPagesData?.data?.tableData) {
      return [];
    }

    return popularPagesData.data.tableData.map((item) => ({
      rank: item.rank,
      pageName: item.pageName,
      screenPageViews: item.screenPageViews,
      activeUsers: item.activeUsers,
      avgViewsPerUser: parseFloat(item.avgViewsPerUser),
      formattedPageViews: item.screenPageViews.toLocaleString(),
      formattedActiveUsers: item.activeUsers.toLocaleString(),
    }));
  }, [popularPagesData]);

  // Process traffic source table data
  const trafficSourceTableData = useMemo(() => {
    console.log("Processing traffic source table data...");
    console.log("Traffic source data:", trafficSourceData);
    console.log("Current limit:", trafficSourceLimit);

    if (!trafficSourceData?.success || !trafficSourceData?.data?.tableData) {
      console.log("No valid traffic source data available");
      return [];
    }

    const processedData = trafficSourceData.data.tableData
      .map((item) => {
        const activeUsers = Number(item.activeUsers);
        const percentage = Number(item.percentage);
        const avgDailyUsers = Number(item.avgDailyUsers);

        // Validate that all numeric values are valid numbers
        if (isNaN(activeUsers) || isNaN(percentage) || isNaN(avgDailyUsers)) {
          console.warn("Invalid numeric data found:", item);
          return null;
        }

        return {
          rank: item.rank,
          sourceName: item.sourceName || "Unknown Source",
          activeUsers: activeUsers,
          percentage: percentage.toFixed(1),
          avgDailyUsers: avgDailyUsers.toFixed(1),
          formattedActiveUsers: activeUsers.toLocaleString(),
        };
      })
      .filter((item) => item !== null); // Remove any invalid entries

    console.log("Processed traffic source data:", processedData);
    console.log("Number of items:", processedData.length);
    return processedData;
  }, [trafficSourceData, trafficSourceLimit]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20">
        {/* Header */}
        <div className="bg-background/90 backdrop-blur-sm border-b border-border px-6 py-8 top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Portal Berita Analytics
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Comprehensive audience insights and performance metrics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                className="h-32 bg-white/80 backdrop-blur-sm rounded-2xl animate-pulse"
              >
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-8 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                className="h-96 bg-white/80 backdrop-blur-sm rounded-2xl animate-pulse"
              >
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-4"></div>
                  <div className="h-64 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-8 top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Portal Berita Analytics
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Comprehensive audience insights and performance metrics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                <Activity className="h-3 w-3 mr-1" />
                Live Data
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Audience */}
          <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-2xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-900">
                    Total Audience
                  </p>
                  <p className="text-xs text-muted-foreground">
                    All Users Combined
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold text-indigo-900">
                {dashboardMetrics.hasData
                  ? dashboardMetrics.formattedTotalAudience
                  : "Loading..."}
              </div>
            </CardContent>
          </Card>

          {/* Top Region */}
          <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-2xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    Top Region
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Most Active Users
                  </p>
                </div>
              </div>
              <div
                className="text-lg font-bold text-emerald-900 truncate"
                title={dashboardMetrics.topRegion.name}
              >
                {dashboardMetrics.topRegion.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {dashboardMetrics.hasData
                  ? `${dashboardMetrics.topRegion.users.toLocaleString()} users`
                  : "Loading..."}
              </div>
            </CardContent>
          </Card>

          {/* Top Traffic Source */}
          <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-2xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Top Traffic Source
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Primary Channel
                  </p>
                </div>
              </div>
              <div
                className="text-lg font-bold text-blue-900 truncate"
                title={dashboardMetrics.topTrafficSource.name}
              >
                {dashboardMetrics.topTrafficSource.name}
              </div>
              <div className="text-sm text-gray-600">
                {dashboardMetrics.hasData
                  ? `${dashboardMetrics.topTrafficSource.users.toLocaleString()} users`
                  : "Loading..."}
              </div>
            </CardContent>
          </Card>

          {/* Top External Source */}
          <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-2xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
                  <ExternalLink className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-900">
                    Top External Source
                  </p>
                  <p className="text-xs text-muted-foreground">Main Referrer</p>
                </div>
              </div>
              <div
                className="text-lg font-bold text-purple-900 truncate"
                title={dashboardMetrics.topExternalSource.name}
              >
                {dashboardMetrics.topExternalSource.name}
              </div>
              <div className="text-sm text-gray-600">
                {dashboardMetrics.hasData
                  ? `${dashboardMetrics.topExternalSource.users.toLocaleString()} users`
                  : "Loading..."}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Monthly Audience Trends */}
          <Card className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <LineChart className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-card-foreground">
                    Monthly Audience Trends
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    User engagement over time (Monthly View)
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={audienceChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, angle: -45, textAnchor: "end" }}
                      stroke="#666"
                      height={60}
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="totalUsers"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="Total Users"
                    />
                    <Area
                      type="monotone"
                      dataKey="newUsers"
                      stackId="2"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="New Users"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Age Demographics */}
          <Card className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-card-foreground">
                    Age Demographics
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    User distribution by age groups
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="ageBracket"
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value, name) => [
                        value.toLocaleString(),
                        "Active Users",
                      ]}
                      labelFormatter={(label) => `Age Group: ${label}`}
                    />
                    <Bar
                      dataKey="activeUsers"
                      name="Active Users"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Audience Distribution */}
          <Card className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                  <PieChart className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-card-foreground">
                    Audience Distribution
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Users by audience segment
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={audienceDistributionChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="totalUsers"
                      label={({ percentage }) => `${percentage}%`}
                      labelLine={true}
                    >
                      {audienceDistributionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value, name, props) => [
                        `${value.toLocaleString()} users (${
                          props.payload.percentage
                        }%)`,
                        "Total Users",
                      ]}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          return `Audience: ${payload[0].payload.audienceName}`;
                        }
                        return `Audience: ${label}`;
                      }}
                    />
                    <Legend
                      formatter={(value, entry) => entry.payload.audienceName}
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gender Distribution by Hour (24-Hour Line Chart) */}
          <Card className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <LineChart className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-card-foreground">
                    Gender Distribution by Hour
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    24-hour audience breakdown by gender (00:00 - 23:00)
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {hourlyGenderChartDataCombined &&
                hourlyGenderChartDataCombined.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={hourlyGenderChartDataCombined}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 11, angle: -45, textAnchor: "end" }}
                        stroke="#666"
                        height={80}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                        tickFormatter={(value) =>
                          value >= 1000000
                            ? `${(value / 1000000).toFixed(1)}M`
                            : value >= 1000
                            ? `${(value / 1000).toFixed(0)}K`
                            : value.toString()
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value, name) => [
                          value.toLocaleString(),
                          name,
                        ]}
                      />
                      <Legend wrapperStyle={{ fontSize: "14px" }} />
                      <Line
                        type="linear"
                        dataKey="female"
                        name="Female"
                        stroke="#ff69b4"
                        strokeWidth={2}
                        dot={{ fill: "#ff69b4", r: 2 }}
                        activeDot={{ r: 4 }}
                      />
                      <Line
                        type="linear"
                        dataKey="male"
                        name="Male"
                        stroke="#4169e1"
                        strokeWidth={2}
                        dot={{ fill: "#4169e1", r: 2 }}
                        activeDot={{ r: 4 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <p className="text-lg font-semibold mb-2">
                        No Hourly Data Available
                      </p>
                      <p className="text-sm">
                        24-hour gender distribution data is not available yet.
                      </p>
                      <p className="text-xs mt-2">
                        Check console for API response details.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Regional Analysis */}
          <Card className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 text-white">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-card-foreground">
                    Top Regions
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Most active regions by user count
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={regionChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="region"
                      tick={{ fontSize: 11, angle: -45, textAnchor: "end" }}
                      stroke="#666"
                      height={80}
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      labelFormatter={(label, payload) => {
                        const data = regionChartData.find(
                          (item) => item.region === label
                        );
                        return data ? data.fullRegion : label;
                      }}
                    />
                    <Bar
                      dataKey="activeUsers"
                      name="Active Users"
                      fill="#e11d48"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Traffic Source Chart */}
          <Card className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-card-foreground">
                      Top Traffic Sources
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Leading sources driving user acquisition
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      console.log("Clicked Top 5 button, setting limit to 5");
                      setTrafficSourceLimit(5);
                    }}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      trafficSourceLimit === 5
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Top 5
                  </button>
                  <button
                    onClick={() => {
                      console.log("Clicked Top 10 button, setting limit to 10");
                      setTrafficSourceLimit(10);
                    }}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      trafficSourceLimit === 10
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Top 10
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  {trafficSourceTableData &&
                  trafficSourceTableData.length > 0 ? (
                    <BarChart
                      data={trafficSourceTableData}
                      layout="vertical"
                      margin={{
                        left: 5,
                        right: 20,
                        top: 5,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        type="number"
                        dataKey="activeUsers"
                        fontSize={10}
                        stroke="#666"
                        tickFormatter={(value) =>
                          value >= 1000000
                            ? `${(value / 1000000).toFixed(1)}M`
                            : value >= 1000
                            ? `${(value / 1000).toFixed(0)}K`
                            : value.toString()
                        }
                        domain={[0, "dataMax"]}
                        allowDecimals={false}
                      />
                      <YAxis
                        dataKey="sourceName"
                        type="category"
                        tickLine={false}
                        tickMargin={5}
                        axisLine={false}
                        fontSize={9}
                        stroke="#666"
                        width={120}
                        interval={0}
                        tickFormatter={(value) => {
                          // Truncate long source names for Y-axis display
                          return value.length > 15
                            ? value.substring(0, 12) + "..."
                            : value;
                        }}
                      />
                      <Tooltip
                        cursor={false}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value, name) => [
                          value.toLocaleString(),
                          "Active Users",
                        ]}
                        labelFormatter={(label) => `Source: ${label}`}
                      />
                      <Bar
                        dataKey="activeUsers"
                        fill="#3b82f6"
                        radius={2}
                        name="Active Users"
                      />
                    </BarChart>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Loading chart data...
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Pages Table Section */}
        <div className="mt-8">
          <Card className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-card-foreground">
                      Popular Pages
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Most viewed pages by screen page views
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPopularPagesLimit(5)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      popularPagesLimit === 5
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Top 5
                  </button>
                  <button
                    onClick={() => setPopularPagesLimit(10)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      popularPagesLimit === 10
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Top 10
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        #
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Page Name
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground">
                        Page Views
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground">
                        Active Users
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground">
                        Avg Views/User
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {popularPagesTableData.map((page, index) => (
                      <tr
                        key={index}
                        className={`border-b border-border hover:bg-muted/50 transition-colors ${
                          index % 2 === 0 ? "bg-muted/20" : "bg-background"
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                page.rank === 1
                                  ? "bg-yellow-100 text-yellow-800"
                                  : page.rank === 2
                                  ? "bg-gray-100 text-gray-800"
                                  : page.rank === 3
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-indigo-100 text-indigo-800"
                              }`}
                            >
                              {page.rank}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 relative">
                          <div className="relative group">
                            <div
                              className="font-medium text-foreground max-w-xs truncate cursor-pointer hover:text-primary transition-all duration-300 ease-out"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(
                                    page.pageName
                                  );
                                  // Show copied confirmation
                                  const element = document.getElementById(
                                    `copied-${index}`
                                  );
                                  if (element) {
                                    element.classList.remove("opacity-0");
                                    element.classList.add("opacity-100");
                                    setTimeout(() => {
                                      element.classList.remove("opacity-100");
                                      element.classList.add("opacity-0");
                                    }, 2000);
                                  }
                                } catch (err) {
                                  console.error("Failed to copy text: ", err);
                                }
                              }}
                            >
                              {page.pageName}
                              {page.pageName.length > 40 && (
                                <span className="ml-1 text-muted-foreground text-xs">
                                  ...
                                </span>
                              )}
                            </div>
                            {/* Hover Tooltip - Always show full name */}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-4 py-2.5 bg-popover border border-border text-popover-foreground text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out group-hover:translate-y-0 translate-y-1 pointer-events-none whitespace-nowrap z-[9999]">
                              {page.pageName}
                              <div className="text-xs text-muted-foreground mt-1">
                                Click to copy
                              </div>
                              {/* Arrow */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2">
                                <div className="w-2 h-2 bg-popover border-r border-b border-border transform rotate-45 -mt-1"></div>
                              </div>
                            </div>
                            {/* Copied Confirmation */}
                            <div
                              id={`copied-${index}`}
                              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg shadow-lg opacity-0 transition-all duration-200 ease-out pointer-events-none whitespace-nowrap z-[10000]"
                            >
                              Copied!
                              {/* Arrow */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2">
                                <div className="w-2 h-2 bg-primary transform rotate-45 -mt-1"></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-foreground">
                            {page.formattedPageViews}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-foreground">
                            {page.formattedActiveUsers}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-muted-foreground">
                            {page.avgViewsPerUser}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {popularPagesTableData.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No popular pages data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Summary */}
        <div className="mt-12 p-6 bg-muted/80 backdrop-blur-sm rounded-2xl border border-border">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              📊 Portal Berita Insights
            </h3>
            <p className="text-muted-foreground mb-4">
              Real-time analytics from Portal Berita platform showing audience
              engagement, demographic breakdowns, and regional performance
              metrics.
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-foreground">Live Data Integration</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-foreground">Real-time Updates</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-foreground">Interactive Charts</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalBeritaPage;

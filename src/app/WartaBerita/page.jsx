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
  const [regionData, setRegionData] = useState(null);

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

  // Fetch audience data for charts
  useEffect(() => {
    const fetchAudienceData = async () => {
      try {
        const response = await fetch("/api/pb-audience");
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

  // Process audience chart data
  const audienceChartData = useMemo(() => {
    if (!audienceData?.success || !audienceData?.data?.chartData) {
      return [];
    }

    return audienceData.data.chartData
      .slice(0, 30) // Show last 30 days
      .map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-GB", {
          month: "short",
          day: "numeric",
        }),
        totalUsers: item.totalUsers,
        newUsers: item.newUsers,
        returningUsers: item.returningUsers,
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

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-8 sticky top-0 z-50 shadow-sm">
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
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
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
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-8 sticky top-0 z-50 shadow-sm">
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
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-indigo-200 rounded-2xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-900">
                    Total Audience
                  </p>
                  <p className="text-xs text-gray-500">All Users Combined</p>
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
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-indigo-200 rounded-2xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    Top Region
                  </p>
                  <p className="text-xs text-gray-500">Most Active Users</p>
                </div>
              </div>
              <div
                className="text-lg font-bold text-emerald-900 truncate"
                title={dashboardMetrics.topRegion.name}
              >
                {dashboardMetrics.topRegion.name}
              </div>
              <div className="text-sm text-gray-600">
                {dashboardMetrics.hasData
                  ? `${dashboardMetrics.topRegion.users.toLocaleString()} users`
                  : "Loading..."}
              </div>
            </CardContent>
          </Card>

          {/* Top Traffic Source */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-indigo-200 rounded-2xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Top Traffic Source
                  </p>
                  <p className="text-xs text-gray-500">Primary Channel</p>
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
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-indigo-200 rounded-2xl hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
                  <ExternalLink className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-900">
                    Top External Source
                  </p>
                  <p className="text-xs text-gray-500">Main Referrer</p>
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
          {/* Daily Audience Trends */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <LineChart className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Daily Audience Trends
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    User engagement over time
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={audienceChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
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
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Age Demographics
                  </CardTitle>
                  <p className="text-sm text-gray-600">
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

          {/* Gender Distribution */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <PieChart className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Gender Distribution
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Audience breakdown by gender
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={genderChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="activeUsers"
                      label={({ gender, percentage }) =>
                        `${gender}: ${percentage}%`
                      }
                      labelLine={false}
                    >
                      {genderChartData.map((entry, index) => (
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
                      formatter={(value, name) => [
                        value.toLocaleString(),
                        "Active Users",
                      ]}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Regional Analysis */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 text-white">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Top Regions
                  </CardTitle>
                  <p className="text-sm text-gray-600">
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
        </div>

        {/* Footer Summary */}
        <div className="mt-12 p-6 bg-indigo-50/80 backdrop-blur-sm rounded-2xl border border-indigo-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">
              📊 Portal Berita Insights
            </h3>
            <p className="text-indigo-700 mb-4">
              Real-time analytics from Portal Berita platform showing audience
              engagement, demographic breakdowns, and regional performance
              metrics.
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-indigo-800">Live Data Integration</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-indigo-800">Real-time Updates</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-indigo-800">Interactive Charts</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalBeritaPage;

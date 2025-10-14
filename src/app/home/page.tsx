"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Clock,
  TrendingUp,
  Trophy,
  ExternalLink,
  Tv,
  Wifi,
  Radio,
  Monitor,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  DollarSign,
  ChartNoAxesCombined,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import TVMonthlyPerformanceChart from "@/components/Marketing/TVMonthlyPerformanceChart";
import { useMarketingData } from "@/hooks/useMarketingData";
import { useMarketingTable2Data } from "@/hooks/useMarketingTable2Data";
import { useRadioChannelsData } from "@/hooks/useRadioChannelsData";
import { useRadioMonthlyData } from "@/hooks/useRadioMonthlyData";
import { useTVMonthlyData } from "@/hooks/useTVMonthlyData";
import RadioMonthlyPerformanceChart from "@/components/Marketing/RadioMonthlyPerformanceChart";
import MarketingPerformanceTable from "@/components/Marketing/MarketingPerformanceTable";

const HomepageDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("202502");
  const [mytvData, setMytvData] = useState(null);
  const [marketingData, setMarketingData] = useState(null);
  const [portalBeritaData, setPortalBeritaData] = useState(null);

  // Total audience for MyTV platform
  const totalAudience = 7581399;

  // Mock data for UnifiTV (from unifi_summary table)
  const unifiData = {
    mau_total: 518883,
    duration_total_hour: 2345678,
    programmes: [
      { programme_name: "Berita RTM", duration_total_hour: 456789 },
      { programme_name: "TV1 Drama", duration_total_hour: 389456 },
      { programme_name: "Sukan RTM", duration_total_hour: 234567 },
    ],
  };

  // Calculate UnifiTV metrics
  const unifiMetrics = {
    mau: unifiData.mau_total,
    totalHours: unifiData.duration_total_hour,
    avgHoursPerUser: (
      unifiData.duration_total_hour / unifiData.mau_total
    ).toFixed(1),
    topChannel: {
      name: unifiData.programmes[0].programme_name,
      percentage: (
        (unifiData.programmes[0].duration_total_hour /
          unifiData.duration_total_hour) *
        100
      ).toFixed(1),
    },
  };

  // Fetch MyTV data
  useEffect(() => {
    const fetchMytvData = async () => {
      try {
        const response = await fetch("/api/mytv-analysis");
        const data = await response.json();
        console.log("MyTV API Response:", data);
        console.log("Channel Metrics:", data?.channelMetrics);
        setMytvData(data);
      } catch (error) {
        console.error("Error fetching MyTV data:", error);
      }
    };

    fetchMytvData();
  }, []);

  // Fetch Marketing data
  useEffect(() => {
    const fetchMarketingData = async () => {
      try {
        console.log("Fetching marketing data...");
        const response = await fetch("/api/marketing-analysis");
        console.log("Marketing response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Marketing API Response:", data);
        console.log("Marketing Data Success:", data?.success);
        console.log("Marketing Saluran Metrics:", data?.data?.saluranMetrics);
        setMarketingData(data);
      } catch (error) {
        console.error("Error fetching Marketing data:", error);
        console.error("Full error details:", error.message);
      }
    };

    fetchMarketingData();
  }, []);

  // Fetch Portal Berita data
  useEffect(() => {
    const fetchPortalBeritaData = async () => {
      try {
        console.log("Fetching Portal Berita data...");
        const response = await fetch("/api/pb-dashboard-summary");
        console.log("Portal Berita response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Portal Berita API Response:", data);
        setPortalBeritaData(data);
      } catch (error) {
        console.error("Error fetching Portal Berita data:", error);
        console.error("Full error details:", error.message);
      }
    };

    fetchPortalBeritaData();
  }, []);

  // Calculate MyTV metrics using the mytv-analysis API
  const mytvMetrics = useMemo(() => {
    if (!mytvData?.channelMetrics || !Array.isArray(mytvData.channelMetrics)) {
      return {
        totalViewers: 0,
        topChannel: {
          name: "No data",
          audienceShare: "Data not available",
          avgViewers: "Data not available",
        },
        top3Channels: [],
        lowestChannel: {
          name: "No data",
          audienceShare: "Data not available",
          avgViewers: "Data not available",
        },
        allChannels: [],
        hasData: false,
      };
    }

    // Use the channel metrics data from the mytv-analysis API
    const channelData = mytvData.channelMetrics;

    // Calculate total audience share
    const totalAudienceShare = channelData.reduce(
      (sum, item) => sum + (parseFloat(item.audienceShare) || 0),
      0
    );

    // Process channels data
    const channelsWithData = channelData
      .map((item) => {
        const audienceShare = parseFloat(item.audienceShare) || 0;
        const avgViewers = parseInt(item.avgViewers) || 0;

        return {
          name: item.channel || "Unknown",
          audienceShare: audienceShare,
          displayAudienceShare:
            audienceShare > 0 ? `${audienceShare}%` : "Data not available",
          avgViewers,
          displayAvgViewers:
            avgViewers !== null
              ? avgViewers.toLocaleString()
              : "Data not available",
        };
      })
      .filter((item) => item.audienceShare > 0 || item.avgViewers !== null)
      .sort((a, b) => (b.audienceShare || 0) - (a.audienceShare || 0));

    if (channelsWithData.length === 0) {
      return {
        totalViewers: 0,
        topChannel: {
          name: "No data",
          audienceShare: "Data not available",
          avgViewers: "Data not available",
        },
        top3Channels: [],
        lowestChannel: {
          name: "No data",
          audienceShare: "Data not available",
          avgViewers: "Data not available",
        },
        allChannels: [],
        hasData: false,
      };
    }

    // Get top channel
    const topChannel = channelsWithData[0] || {
      name: "No data",
      displayAudienceShare: "Data not available",
      displayAvgViewers: "Data not available",
    };

    // Get top 3 channels
    const top3Channels = channelsWithData.slice(0, 3);

    // Get lowest channel
    const lowestChannel = channelsWithData[channelsWithData.length - 1] || {
      name: "No data",
      displayAudienceShare: "Data not available",
      displayAvgViewers: "Data not available",
    };

    return {
      totalViewers: totalAudience, // Using the fixed total audience number
      topChannel: {
        name: topChannel.name,
        audienceShare: topChannel.displayAudienceShare,
        avgViewers: topChannel.displayAvgViewers,
      },
      top3Channels,
      lowestChannel: {
        name: lowestChannel.name,
        audienceShare: lowestChannel.displayAudienceShare,
        avgViewers: lowestChannel.displayAvgViewers,
      },
      allChannels: channelsWithData,
      hasData: true,
    };
  }, [mytvData]);

  // Calculate Marketing metrics
  const marketingMetrics = useMemo(() => {
    console.log("Calculating marketing metrics...");
    console.log("Marketing data:", marketingData);
    console.log("Marketing data success:", marketingData?.success);
    console.log(
      "Marketing data saluranMetrics:",
      marketingData?.data?.saluranMetrics
    );

    if (!marketingData?.success || !marketingData?.data?.saluranMetrics) {
      console.log("Marketing data not available, returning default values");
      return {
        hasData: false,
        totalValue: 0,
        topSaluran: { name: "No data", value: 0, change: "N/A" },
        overallChange: "N/A",
        totalSaluran: 0,
        top3Saluran: [],
      };
    }

    const { saluranMetrics, summary } = marketingData.data;
    console.log("Marketing summary:", summary);

    const result = {
      hasData: true,
      totalValue: summary.totalCurrent,
      formattedTotalValue: summary.formattedTotalCurrent,
      totalPreviousValue: summary.totalPrevious,
      formattedTotalPreviousValue: summary.formattedTotalPrevious,
      topSaluran: summary.topSaluran
        ? {
            name: summary.topSaluran.saluran,
            value: summary.topSaluran.currentValue,
            formattedValue: summary.topSaluran.formattedCurrentValue,
            change: summary.topSaluran.formattedChange,
            direction: summary.topSaluran.changeDirection,
          }
        : { name: "No data", value: 0, change: "N/A" },
      overallChange: summary.overallChange,
      overallDirection: summary.overallDirection,
      totalSaluran: summary.totalSaluran,
      activeSaluran: summary.activeSaluran,
      top3Saluran: saluranMetrics.slice(0, 3),
    };

    console.log("Final marketing metrics:", result);
    return result;
  }, [marketingData]);

  // Calculate Portal Berita metrics
  const portalBeritaMetrics = useMemo(() => {
    console.log("Calculating Portal Berita metrics...");
    console.log("Portal Berita data:", portalBeritaData);

    if (!portalBeritaData?.success || !portalBeritaData?.data) {
      console.log("Portal Berita data not available, returning default values");
      return {
        hasData: false,
        totalAudience: 0,
        topRegion: { name: "No data", users: 0 },
        topTrafficSource: { name: "No data", users: 0 },
        topExternalSource: { name: "No data", users: 0 },
      };
    }

    const { data } = portalBeritaData;
    console.log("Portal Berita summary:", data.summary);

    return {
      hasData: data.summary.hasData,
      totalAudience: data.totalAudience,
      formattedTotalAudience: data.summary.formattedTotalAudience,
      topRegion: data.topRegion,
      topTrafficSource: data.topTrafficSource,
      topExternalSource: data.topExternalSource,
      metrics: data.summary.metrics,
    };
  }, [portalBeritaData]);

  // Platform data structure
  const platforms = [
    {
      id: "rtmclick",
      name: "RTMKlik",
      icon: <Radio className="h-8 w-8" />,
      color: "from-amber-500 to-amber-600",
      borderColor: "border-amber-200",
      bgColor: "bg-amber-50",
      textColor: "text-amber-900",
      link: "/RTMClick",
      hasData: false,
      metrics: {
        topChannel: "No data available yet",
        totalHours: "No data available yet",
      },
    },
    {
      id: "mytv",
      name: "MyTV",
      icon: <Tv className="h-8 w-8" />,
      color: "from-blue-500 to-blue-600",
      borderColor: "border-blue-200",
      bgColor: "bg-blue-50",
      textColor: "text-blue-900",
      link: "/MyTVViewership",
      hasData: mytvMetrics.hasData,
      metrics: {
        topChannel: mytvMetrics.hasData
          ? `${mytvMetrics.topChannel.name} - ${mytvMetrics.topChannel.audienceShare}`
          : "No data",
        totalHours: (987654).toLocaleString(),
      },
    },
    {
      id: "astro",
      name: "ASTRO",
      icon: <Star className="h-8 w-8" />,
      color: "from-purple-500 to-purple-600",
      borderColor: "border-purple-200",
      bgColor: "bg-purple-50",
      textColor: "text-purple-900",
      link: "/ASTRO",
      hasData: false,
      metrics: {
        topChannel: "No data available yet",
        totalHours: "No data available yet",
      },
    },
    {
      id: "unifitv",
      name: "UnifiTV",
      icon: <Wifi className="h-8 w-8" />,
      color: "from-emerald-500 to-emerald-600",
      borderColor: "border-emerald-200",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-900",
      link: "/UnifiTV",
      hasData: true,
      metrics: {
        topChannel: `${unifiMetrics.topChannel.name} (${unifiMetrics.topChannel.percentage}%)`,
        totalHours: unifiMetrics.totalHours.toLocaleString(),
      },
    },
    {
      id: "wartaberita",
      name: "Portal Berita",
      icon: <Monitor className="h-8 w-8" />,
      color: "from-indigo-500 to-indigo-600",
      borderColor: "border-indigo-200",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-900",
      link: "/WartaBerita",
      hasData: portalBeritaMetrics.hasData,
      metrics: {
        topChannel: portalBeritaMetrics.hasData
        ? `${portalBeritaMetrics.topExternalSource.name}`
        : "No data available yet",
        totalHours: portalBeritaMetrics.hasData
          ? `${
              portalBeritaMetrics.topRegion.name
            } (${portalBeritaMetrics.topRegion.users.toLocaleString()})`
          : "No data available yet",
      },
    },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Helper functions for marketing change indicators
    const getChangeIcon = (direction) => {
      switch (direction) {
        case "increase":
          return <ArrowUp className="h-3 w-3 text-green-600" />;
        case "decrease":
          return <ArrowDown className="h-3 w-3 text-red-600" />;
        case "new":
          return <Star className="h-3 w-3 text-blue-600" />;
        case "discontinued":
          return <Minus className="h-3 w-3 text-gray-600" />;
        default:
          return <Minus className="h-3 w-3 text-gray-600" />;
      }
    };

    const getChangeColor = (direction) => {
      switch (direction) {
        case "increase":
          return "text-green-600";
        case "decrease":
          return "text-red-600";
        case "new":
          return "text-blue-600";
        case "discontinued":
          return "text-gray-600";
        default:
          return "text-gray-600";
      }
    };

  const PlatformCard = ({ platform }) => {
    // Check if platform has any real data
    const hasAnyData =
      platform.hasData &&
      ((platform.metrics.totalHours !== "No data" &&
          platform.metrics.totalHours !== "N/A") ||
        (platform.metrics.topChannel !== "No data" &&
          platform.metrics.topChannel !== "N/A"));


    // Default layout for other platforms
    const availableMetrics = [
      {
        key: "topChannel",
        icon: <Trophy className="h-4 w-4 text-gray-700" />,
        label: platform.id === "marketing" ? "Top Saluran" : "Top Channel",
        value: platform.metrics.topChannel,
        show:
          platform.metrics.topChannel !== "No data" &&
          platform.metrics.topChannel !== "N/A",
      },
      {
        key: "totalHours",
        icon: <Clock className="h-4 w-4 text-gray-700" />,
        label: platform.id === "marketing" ? "Saluran" : "Hours",
        value: platform.metrics.totalHours,
        show:
          platform.metrics.totalHours !== "No data" &&
          platform.metrics.totalHours !== "N/A",
      },
    ].filter((metric) => metric.show);

    // Get icon color based on platform id
    const getIconBgColor = (platformId) => {
      switch (platformId) {
        case "unifitv":
          return "bg-emerald-100 text-emerald-700";
        case "astro":
          return "bg-purple-100 text-purple-700";
        case "rtmclick":
          return "bg-amber-100 text-amber-700";
        case "mytv":
          return "bg-blue-100 text-blue-700";
        case "wartaberita":
          return "bg-indigo-100 text-indigo-700";
        default:
          return "bg-gray-100 text-gray-700";
      }
    };

    return (
      <Link href={platform.link} className="block group">
        <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-gray-900 mt-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-row items-center space-x-3 gap-3">
                  <div className={`p-2 rounded-lg ${getIconBgColor(platform.id)}`}>
                    {platform.icon}
                  </div>
                  {platform.name}
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasAnyData ? (
              <>
                {/* Metrics Grid - Dynamic Layout */}
                <div
                  className={`grid gap-3 ${
                    availableMetrics.length === 1
                      ? "grid-cols-1"
                      : availableMetrics.length === 2
                      ? "grid-cols-2"
                      : availableMetrics.length === 3
                      ? "grid-cols-2"
                      : "grid-cols-2"
                  }`}
                >
                  {availableMetrics.map((metric, index) => (
                    <div
                      key={metric.key}
                      className={`p-3 rounded-lg bg-gray-50 border border-gray-200 ${
                        availableMetrics.length === 3 && index === 2
                          ? "col-span-2"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {metric.icon}
                        <span className="text-xs font-semibold text-gray-900">
                          {metric.label}
                        </span>
                      </div>
                      <div
                        className="text-lg font-bold text-gray-900 truncate"
                        title={
                          metric.key === "topChannel" ? metric.value : undefined
                        }
                      >
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Click Indicator */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-gray-500 group-hover:text-gray-700 transition-colors">
                    <span className="text-xs font-medium">
                      Click for details
                    </span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              </>
            ) : (
              /* No Data State */
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <div className="p-3 rounded-full bg-gray-50 border border-gray-200">
                  <Monitor className="h-6 w-6 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-gray-500 font-medium text-sm">
                    More data coming soon
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Check back later for updates
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  };

  const MarketingCard = () => {
    const {
      data: tvMonthlyData,
      isLoading: tvLoading,
      error: tvError,
    } = useTVMonthlyData() || {tvError: true, data: {chartData: null, summary: null}};
    const {
      data: radioMonthlyData,
      isLoading: radioLoading,
      error: radioError,
    } = useRadioMonthlyData();
    const { chartData: tvChartData = null, summary: tvSummary = null } = tvMonthlyData?.data || {};
    const { summary, saluranMetrics } = marketingData?.data || { summary: {}, saluranMetrics: [] };

    console.log("Summary Saluran Metrics:", summary);
    const YearlyGrowth = () => {
      interface YearlyGrowthProps {
        changeDirection: "increase" | "decrease";
        currentValue: number;
        formatted2022Value: string;
        formattedChange: string;
        formattedCurrentValue: string;
        formattedPreviousValue: string;
        percentageChange: number;
        previousValue: number;
        saluran: string;
        year2022Value: number;
      }
      interface YearlyMetricsProps {
        key: string;
        label: string;
        changeDirection: string;
        percentageChange: number;
        value: any;
      }
      const yoyMetrics: YearlyMetricsProps[] = saluranMetrics
        ? saluranMetrics.map((item: YearlyGrowthProps) => ({
          key: item.saluran,
          label: item.saluran,
          changeDirection: item.changeDirection,
          percentageChange: item.percentageChange,
          value: item.formattedCurrentValue,
        }))
      : [];
        
      const totalYoyMetrics: YearlyMetricsProps = {
        key: "totalValue",
        label: "Total Value",
        changeDirection: summary?.overallDirection || "N/A",
        percentageChange: summary?.overallChange || 0,
        value: summary?.formattedTotalCurrent || "N/A",
      };

      return (
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-gray-900 mt-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-row items-center space-x-3 gap-3">
                  {/* <div className={`p-2 rounded-lg bg-red-100 text-red-700`}>
                    <ChartNoAxesCombined className="h-8 w-8" />
                  </div> */}
                  Yearly Marketing Growth
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col h-fit">
            {/* Saluran Metrics Comparison */}
            <div
              className={`grid gap-3 grid-cols-3`}
            >
              {yoyMetrics.map((metric, index) => (
                <div
                  key={metric.key}
                  className={`p-3 rounded-lg bg-gray-50 border border-gray-200`}
                >
                  <div className="flex justify-between space-x-2 mb-1">
                    <span className="text-xs font-semibold text-gray-900">
                      {metric.label}
                    </span>
                    <span>
                      {metric.changeDirection !== "N/A" && (
                        <span
                          className={`inline-flex items-center space-x-1 text-xs font-medium ${getChangeColor(
                            metric.changeDirection
                          )}`}
                        >
                          {getChangeIcon(metric.changeDirection)}
                          <span>{metric.percentageChange.toPrecision(3)}%</span>
                        </span>
                      )}
                    </span>
                  </div>
                  <div
                    className="text-lg font-bold text-gray-900 truncate"
                    title={
                      metric.key === "topChannel" ? metric.value : undefined
                    }
                  >
                    {metric.key === "topChannel" ? (
                      <span className="text-sm">{metric.value}</span>
                    ) : (
                      metric.value
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Metrics */}
            <div
              key={totalYoyMetrics.key}
              className="p-3 rounded-lg bg-gray-50 border border-gray-200"
            >
              <div className="w-1/3 mx-auto">
                <div className="flex justify-between space-x-2 mb-1">
                  <span className="text-xs font-semibold text-gray-900">
                    {totalYoyMetrics.label}
                  </span>
                  <span>
                    {totalYoyMetrics.changeDirection !== "N/A" && (
                      <span
                        className={`inline-flex items-center space-x-1 text-xs font-medium ${getChangeColor(
                          totalYoyMetrics.changeDirection
                        )}`}
                      >
                        {getChangeIcon(totalYoyMetrics.changeDirection)}
                        <span>{totalYoyMetrics.percentageChange}%</span>
                      </span>
                    )}
                  </span>
                </div>
                <div
                  className="text-lg font-bold text-gray-900 truncate text-center"
                  title={totalYoyMetrics.key}
                >
                  {totalYoyMetrics.value}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
    
    const RadioMonthlyCard = () => {
      return (
        !radioError ? (
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-gray-900 mt-3">
                <div className="flex items-center justify-between">
                  Radio Monthly Performance
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex flex-col gap-6 h-full">
              {/* Radio Charts Row */}
              <RadioMonthlyPerformanceChart data={radioMonthlyData?.data} />
            </CardContent>
          </Card>
        ) : (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-600">Failed to load Radio monthly performance data.</p>
          </div>
        )
      )
    };

    return (
      <Link href="/Marketing" className="block group h-full">
        <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-gray-900 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-row items-center space-x-3 gap-3">
                <div className={`p-2 rounded-lg bg-red-100 text-red-700`}>
                  <DollarSign className="h-8 w-8" />
                </div>
                Marketing Revenue
              </div>
              <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col gap-6 h-full">
            {/* TV Charts Row */}
            <div className="grid gap-6 lg:grid-cols-1 h-full">
              {!tvError 
              ? (<TVMonthlyPerformanceChart data={tvChartData} />)
              : (<div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-600">Failed to load TV monthly performance data.</p>
                </div>)
              }
            </div>
            {/* Radio Charts Row */}
            <div className="grid gap-6 lg:grid-cols-1 h-full">
              <RadioMonthlyCard />
            </div>
            {/* Yearly Growth Comparison */}
            <div className="grid gap-6 lg:grid-cols-1 h-full">
              {<YearlyGrowth />}
            </div>
            {/* Click Indicator */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-gray-500 group-hover:text-gray-700 transition-colors">
                    <span className="text-xs font-medium">
                      Click for details
                    </span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Header />
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Multi-Platform Performance Overview
          </h1>
          <p className="text-muted-foreground">
            Comprehensive analytics across 6 streaming platforms
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-64 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded mt-4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>

            {/* Platform Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-6">
                {platforms.map((platform) => (
                  <PlatformCard key={platform.id} platform={platform} />
                ))}
              </div>
              <div>
                <MarketingCard />
              </div>
            </div>

            {/* Footer Note */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    📊 Data Status
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Currently showing data for <strong>UnifiTV</strong>,{" "}
                    <strong>MyTV</strong>, <strong>Marketing Revenue</strong>,
                    and <strong>Portal Berita</strong> platforms. Other
                    platforms will be integrated as data becomes available.
                  </p>
                  <div className="flex justify-center space-x-4 text-sm">
                    <span className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Live Data Available</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span>Placeholder Data</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default HomepageDashboard;

/*
    TODO:
    - Get correct colors for each platform
    - Get real data for each platform
*/
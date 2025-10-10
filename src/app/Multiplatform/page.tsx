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
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";

const MultiplatformPage = () => {
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
        mau: unifiMetrics.mau.toLocaleString(),
        totalHours: unifiMetrics.totalHours.toLocaleString(),
        avgHours: unifiMetrics.avgHoursPerUser,
        topChannel: `${unifiMetrics.topChannel.name} (${unifiMetrics.topChannel.percentage}%)`,
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
        mau:
          mytvMetrics.totalViewers > 0
            ? mytvMetrics.totalViewers.toLocaleString()
            : "No data",
        totalHours: "N/A",
        avgHours: "N/A",
        topChannel: mytvMetrics.hasData
          ? `${mytvMetrics.topChannel.name} – ${mytvMetrics.topChannel.audienceShare}`
          : "No data",
      },
    },
    {
      id: "marketing",
      name: "Marketing Revenue",
      icon: <DollarSign className="h-8 w-8" />,
      color: "from-rose-500 to-rose-600",
      borderColor: "border-rose-200",
      bgColor: "bg-rose-50",
      textColor: "text-rose-900",
      link: "/Marketing",
      hasData: marketingMetrics.hasData,
      metrics: {
        mau: marketingMetrics.hasData
          ? (marketingMetrics as any).formattedTotalValue
          : "No data available yet",
        totalHours: marketingMetrics.hasData
          ? `${(marketingMetrics as any).activeSaluran} Active Saluran`
          : "No data available yet",
        avgHours: marketingMetrics.hasData
          ? `${marketingMetrics.overallChange}% YoY`
          : "No data available yet",
        topChannel: marketingMetrics.hasData
          ? `${marketingMetrics.topSaluran.name} (${marketingMetrics.topSaluran.change})`
          : "No data available yet",
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
        mau: "No data available yet",
        totalHours: "No data available yet",
        avgHours: "No data available yet",
        topChannel: "No data available yet",
      },
    },
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
        mau: "No data available yet",
        totalHours: "No data available yet",
        avgHours: "No data available yet",
        topChannel: "No data available yet",
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
        mau: portalBeritaMetrics.hasData
          ? portalBeritaMetrics.formattedTotalAudience
          : "No data available yet",
        totalHours: portalBeritaMetrics.hasData
          ? `${
              portalBeritaMetrics.topRegion.name
            } (${portalBeritaMetrics.topRegion.users.toLocaleString()})`
          : "No data available yet",
        avgHours: portalBeritaMetrics.hasData
          ? `${portalBeritaMetrics.topTrafficSource.name}`
          : "No data available yet",
        topChannel: portalBeritaMetrics.hasData
          ? `${portalBeritaMetrics.topExternalSource.name}`
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

  const PlatformCard = ({ platform }) => {
    // Check if platform has any real data
    const hasAnyData =
      platform.hasData &&
      ((platform.metrics.mau !== "No data" && platform.metrics.mau !== "N/A") ||
        (platform.metrics.totalHours !== "No data" &&
          platform.metrics.totalHours !== "N/A") ||
        (platform.metrics.avgHours !== "No data" &&
          platform.metrics.avgHours !== "N/A") ||
        (platform.metrics.topChannel !== "No data" &&
          platform.metrics.topChannel !== "N/A"));

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

    // Special layout for MyTV with enhanced analytics
    if (platform.id === "mytv" && hasAnyData && mytvMetrics.hasData) {
      return (
        <Link href={platform.link} className="block group">
          <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <Tv className="h-8 w-8" />
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mt-3">
                MyTV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Left side: Main stats */}
                <div className="flex-1 space-y-3">
                  {/* Primary Highlight - Top Channel */}
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="h-4 w-4 text-gray-700" />
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Top Channel
                      </span>
                    </div>
                    <div className="text-l font-bold text-gray-900 leading-tight mb-1">
                      {mytvMetrics.topChannel.name}
                    </div>
                    <div className="text-l font-bold text-gray-900 mb-1">
                      {mytvMetrics.topChannel.audienceShare}
                    </div>
                    <div className="text-xs font-medium text-gray-600">
                      Purata Penonton: {mytvMetrics.topChannel.avgViewers}
                    </div>
                  </div>

                  {/* Total Viewers */}
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <Users className="h-4 w-4 text-gray-700" />
                      <span className="text-xs font-semibold text-gray-700">
                        Total Viewers
                      </span>
                    </div>
                    <div className="text-base font-bold text-gray-900">
                      {mytvMetrics.totalViewers.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Right side: Channel breakdown with bar chart */}
                <div className="flex-1 space-y-3">
                  {/* Top 3 Channels */}
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-4 w-4 text-gray-700" />
                      <span className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">
                        Top 3 Channels
                      </span>
                    </div>
                    <div className="space-y-2">
                      {mytvMetrics.top3Channels.map((channel, index) => (
                        <div
                          key={channel.name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                index === 0
                                  ? "bg-yellow-500"
                                  : index === 1
                                  ? "bg-gray-400"
                                  : "bg-amber-600"
                              }`}
                            ></div>
                            <div className="flex flex-col">
                              <span
                                className="text-[10px] font-medium text-gray-900 truncate max-w-16"
                                title={channel.name}
                              >
                                {channel.name}
                              </span>
                              <span className="text-[8px] font-normal text-gray-600">
                                Purata: {channel.displayAvgViewers}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-gray-900">
                            {channel.displayAudienceShare}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lowest Channel */}
                  {mytvMetrics.lowestChannel.name !== "No data" &&
                    mytvMetrics.allChannels.length > 1 && (
                      <div className="p-2 rounded-lg bg-gray-50 border border-gray-200 opacity-60">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-gray-500 font-medium">
                            Lowest:
                          </span>
                          <div className="text-right">
                            <div
                              className="text-[9px] text-gray-500 font-medium truncate max-w-16"
                              title={mytvMetrics.lowestChannel.name}
                            >
                              {mytvMetrics.lowestChannel.name}
                            </div>
                            <div className="text-[8px] text-gray-400">
                              {mytvMetrics.lowestChannel.audienceShare}% |
                              Purata: {mytvMetrics.lowestChannel.avgViewers}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Click Indicator */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-gray-500 group-hover:text-gray-700 transition-colors">
                  <span className="text-xs font-medium">
                    Click for detailed analytics
                  </span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      );
    }

    // Special layout for Marketing with enhanced analytics
    if (platform.id === "marketing" && hasAnyData && marketingMetrics.hasData) {
      // Get individual saluran data from marketingData
      const saluranData = marketingData?.data?.saluranMetrics || [];

      // Create a map of saluran values for easy access
      const saluranMap = {};
      saluranData.forEach((item) => {
        saluranMap[item.saluran] = item;
      });

      // Helper function to get saluran data
      const getSaluranData = (saluranName) => {
        return (
          saluranMap[saluranName] || {
            saluran: saluranName,
            currentValue: 0,
            formattedCurrentValue: "N/A",
            changeDirection: "no change",
            formattedChange: "0%",
          }
        );
      };

      // Use the correct saluran names from the database
      const tvData = getSaluranData("TV"); // Changed from 'TV1' to 'TV'
      const besData = getSaluranData("BES");
      const radioData = getSaluranData("RADIO"); // Changed from 'Radio' to 'RADIO'

      return (
        <Link href={platform.link} className="block group">
          <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                  <DollarSign className="h-8 w-8" />
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mt-3">
                Marketing Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Saluran Cards Grid - TV, BES, Radio, Total */}
              <div className="grid grid-cols-2 gap-3">
                {/* TV */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Tv className="h-3 w-3 text-gray-700" />
                    <span className="text-xs font-semibold text-gray-900">
                      TV
                    </span>
                  </div>
                  <div
                    className="text-sm font-bold text-gray-900 mb-1"
                    title={tvData.formattedCurrentValue}
                  >
                    {tvData.currentValue > 0
                      ? `RM${tvData.currentValue.toLocaleString()}`
                      : "N/A"}
                  </div>
                  {tvData.previousValue > 0 && (
                    <div className="flex flex-row gap-2 text-xs text-gray-500 mb-1">
                      vs RM{tvData.previousValue.toLocaleString()} (2023)
                      <div className="flex items-center space-x-1">
                        <span
                          className={`text-xs font-medium ${getChangeColor(
                            tvData.changeDirection
                          )}`}
                        >
                          {tvData.formattedChange}
                        </span>
                        {getChangeIcon(tvData.changeDirection)}
                      </div>
                    </div>
                  )}
                </div>

                {/* BES */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Radio className="h-3 w-3 text-gray-700" />
                    <span className="text-xs font-semibold text-gray-900">
                      BES
                    </span>
                  </div>
                  <div
                    className="text-sm font-bold text-gray-900 mb-1"
                    title={besData.formattedCurrentValue}
                  >
                    {besData.currentValue > 0
                      ? `RM${besData.currentValue.toLocaleString()}`
                      : "N/A"}
                  </div>
                  {besData.previousValue > 0 && (
                    <div className="flex flex-row gap-2 text-xs text-gray-500 mb-1">
                      vs RM{besData.previousValue.toLocaleString()} (2023)
                      <div className="flex items-center space-x-1">
                        <span
                          className={`text-xs font-medium ${getChangeColor(
                            besData.changeDirection
                          )}`}
                        >
                          {besData.formattedChange}
                        </span>
                        {getChangeIcon(besData.changeDirection)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Radio */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Radio className="h-3 w-3 text-gray-700" />
                    <span className="text-xs font-semibold text-gray-900">
                      Radio
                    </span>
                  </div>
                  <div
                    className="text-sm font-bold text-gray-900 mb-1"
                    title={radioData.formattedCurrentValue}
                  >
                    {radioData.currentValue > 0
                      ? `RM${radioData.currentValue.toLocaleString()}`
                      : "N/A"}
                  </div>
                  {radioData.previousValue > 0 && (
                    <div className="flex flex-row gap-2 text-xs text-gray-500 mb-1">
                      vs RM{radioData.previousValue.toLocaleString()} (2023)
                      <div className="flex items-center space-x-1">
                        <span
                          className={`text-xs font-medium ${getChangeColor(
                            radioData.changeDirection
                          )}`}
                        >
                          {radioData.formattedChange}
                        </span>
                        {getChangeIcon(radioData.changeDirection)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="p-3 rounded-lg bg-gray-100 border border-gray-300">
                  <div className="flex items-center space-x-2 mb-1">
                    <DollarSign className="h-3 w-3 text-gray-700" />
                    <span className="text-xs font-semibold text-gray-900">
                      Total
                    </span>
                  </div>
                  <div
                    className="text-sm font-bold text-gray-900 mb-1"
                    title={(marketingMetrics as any).formattedTotalValue}
                  >
                    RM{marketingMetrics.totalValue.toLocaleString()}
                  </div>
                  {(marketingMetrics as any).totalPreviousValue > 0 && (
                    <div className="flex flex-row gap-2 text-xs text-gray-500 mb-1">
                      vs RM
                      {(
                        marketingMetrics as any
                      ).totalPreviousValue.toLocaleString()}{" "}
                      (2023)
                      <div className="flex items-center space-x-1">
                        <span
                          className={`text-xs font-medium ${getChangeColor(
                            (marketingMetrics as any).overallDirection
                          )}`}
                        >
                          {marketingMetrics.overallChange}%
                        </span>
                        {getChangeIcon(
                          (marketingMetrics as any).overallDirection
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Click Indicator */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-gray-500 group-hover:text-gray-700 transition-colors">
                  <span className="text-xs font-medium">
                    Click for detailed analytics
                  </span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      );
    }

    // Special layout for Portal Berita with enhanced analytics
    if (
      platform.id === "wartaberita" &&
      hasAnyData &&
      portalBeritaMetrics.hasData
    ) {
      return (
        <Link href={platform.link} className="block group">
          <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <Monitor className="h-8 w-8" />
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mt-3">
                Portal Berita
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Portal Berita Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Total Audience */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="h-3 w-3 text-gray-700" />
                    <span className="text-xs font-semibold text-gray-900">
                      Total Audience
                    </span>
                  </div>
                  <div
                    className="text-sm font-bold text-gray-900 mb-1"
                    title={portalBeritaMetrics.formattedTotalAudience}
                  >
                    {portalBeritaMetrics.formattedTotalAudience}
                  </div>
                  <div className="text-xs text-gray-500">
                    All Users Combined
                  </div>
                </div>

                {/* Top Region */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Trophy className="h-3 w-3 text-gray-700" />
                    <span className="text-xs font-semibold text-gray-900">
                      Top Region
                    </span>
                  </div>
                  <div
                    className="text-sm font-bold text-gray-900 mb-1 truncate"
                    title={portalBeritaMetrics.topRegion.name}
                  >
                    {portalBeritaMetrics.topRegion.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {portalBeritaMetrics.topRegion.users.toLocaleString()} users
                  </div>
                </div>

                {/* Top Traffic Source */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="h-3 w-3 text-gray-700" />
                    <span className="text-xs font-semibold text-gray-900">
                      Top Traffic Source
                    </span>
                  </div>
                  <div
                    className="text-sm font-bold text-gray-900 mb-1 truncate"
                    title={portalBeritaMetrics.topTrafficSource.name}
                  >
                    {portalBeritaMetrics.topTrafficSource.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {portalBeritaMetrics.topTrafficSource.users.toLocaleString()}{" "}
                    users
                  </div>
                </div>

                {/* Top External Source */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <ExternalLink className="h-3 w-3 text-gray-700" />
                    <span className="text-xs font-semibold text-gray-900">
                      Top External Source
                    </span>
                  </div>
                  <div
                    className="text-sm font-bold text-gray-900 mb-1 truncate"
                    title={portalBeritaMetrics.topExternalSource.name}
                  >
                    {portalBeritaMetrics.topExternalSource.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {portalBeritaMetrics.topExternalSource.users.toLocaleString()}{" "}
                    users
                  </div>
                </div>
              </div>

              {/* Click Indicator */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-gray-500 group-hover:text-gray-700 transition-colors">
                  <span className="text-xs font-medium">
                    Click for detailed analytics
                  </span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      );
    }

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
      {
        key: "mau",
        icon: <Users className="h-4 w-4 text-gray-700" />,
        label: platform.id === "marketing" ? "Total Revenue" : "MAU",
        value: platform.metrics.mau,
        show:
          platform.metrics.mau !== "No data" && platform.metrics.mau !== "N/A",
      },
      {
        key: "avgHours",
        icon: <TrendingUp className="h-4 w-4 text-gray-700" />,
        label:
          platform.id === "marketing"
            ? "YoY Change"
            : "Average Hours User Watched",
        value:
          platform.id === "marketing"
            ? platform.metrics.avgHours
            : platform.metrics.avgHours !== "N/A"
            ? `${platform.metrics.avgHours}h`
            : platform.metrics.avgHours,
        show:
          platform.metrics.avgHours !== "No data" &&
          platform.metrics.avgHours !== "N/A",
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
        default:
          return "bg-gray-100 text-gray-700";
      }
    };

    return (
      <Link href={platform.link} className="block group">
        <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${getIconBgColor(platform.id)}`}>
                {platform.icon}
              </div>
              <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 mt-3">
              {platform.name}
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
                        {metric.key === "topChannel" ? (
                          <span className="text-sm">{metric.value}</span>
                        ) : (
                          metric.value
                        )}
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
        <div className="flex items-center space-x-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="202502">Feb 2025</option>
            <option value="202501">Jan 2025</option>
            <option value="202412">Dec 2024</option>
          </select>
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
            {/* Summary Stats */}
            {/* <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {platforms.filter((p) => p.hasData).length}
                  </div>
                  <div className="text-sm text-gray-600">
                    Platforms with Data
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {(
                      unifiMetrics.mau +
                      (mytvMetrics.hasData ? mytvMetrics.totalViewers : 0) +
                      (portalBeritaMetrics.hasData
                        ? portalBeritaMetrics.totalAudience
                        : 0)
                    ).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Active Users
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {(unifiMetrics.totalHours / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Hours Viewed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-rose-600">
                    {marketingMetrics.hasData
                      ? (marketingMetrics as any).formattedTotalValue
                      : "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">Marketing Revenue</div>
                </div>
              </div>
            </div> */}

            {/* Platform Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {platforms.map((platform) => (
                <PlatformCard key={platform.id} platform={platform} />
              ))}
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

export default MultiplatformPage;

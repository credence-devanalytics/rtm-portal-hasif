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
import Image from "next/image";

const MultiplatformPage = () => {
  const [loading, setLoading] = useState(true);
  const [mytvData, setMytvData] = useState(null);
  const [marketingData, setMarketingData] = useState(null);
  const [portalBeritaData, setPortalBeritaData] = useState(null);
  const [astroData, setAstroData] = useState(null);
  const [unifiData, setUnifiData] = useState(null);
  const [rtmklikData, setRtmklikData] = useState(null);

  // Total audience for MyTV platform
  const totalAudience = 7581399;

  // Calculate UnifiTV metrics
  const unifiMetrics = useMemo(() => {
    if (!unifiData?.data) {
      return {
        mau: 0,
        totalHours: 0,
        avgHoursPerUser: 0,
        topChannel: {
          name: "No data",
          percentage: "0.0",
        },
      };
    }

    const data = unifiData.data;
    const totalHours = data.duration_total_hour || 0;
    const totalMAU = data.mau_total || 0;

    // Calculate percentage based on MAU if duration data is not available
    let topChannelPercentage = "0.0";
    if (data.programmes && data.programmes[0]) {
      if (totalHours > 0 && data.programmes[0].duration_total_hour > 0) {
        // Use duration percentage if available
        topChannelPercentage = (
          (data.programmes[0].duration_total_hour / totalHours) *
          100
        ).toFixed(1);
      } else if (totalMAU > 0 && data.programmes[0].mau_total > 0) {
        // Fall back to MAU percentage
        topChannelPercentage = (
          (data.programmes[0].mau_total / totalMAU) *
          100
        ).toFixed(1);
      }
    }

    return {
      mau: totalMAU,
      totalHours: totalHours,
      avgHoursPerUser:
        totalMAU > 0 && totalHours > 0
          ? (totalHours / totalMAU).toFixed(1)
          : "0.0",
      topChannel: {
        name: data.programmes[0]?.programme_name || "No data",
        percentage: topChannelPercentage,
        avgViewers:
          data.programmes[0]?.avg_viewers || data.programmes[0]?.mau_total || 0,
      },
    };
  }, [unifiData]);

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

  // Fetch Astro Rate & Reach data
  useEffect(() => {
    const fetchAstroData = async () => {
      try {
        console.log("Fetching Astro Rate & Reach data...");
        const response = await fetch("/api/astro-rate-reach");
        console.log("Astro response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Astro API Response:", data);
        setAstroData(data);
      } catch (error) {
        console.error("Error fetching Astro data:", error);
        console.error("Full error details:", error.message);
      }
    };

    fetchAstroData();
  }, []);

  // Fetch UnifiTV data
  useEffect(() => {
    const fetchUnifiData = async () => {
      try {
        console.log("Fetching UnifiTV data...");
        const response = await fetch("/api/unifitv-summary");
        console.log("UnifiTV response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("UnifiTV API Response:", data);
        setUnifiData(data);
      } catch (error) {
        console.error("Error fetching UnifiTV data:", error);
        console.error("Full error details:", error.message);
      }
    };

    fetchUnifiData();
  }, []);

  // Fetch RTMKlik data
  useEffect(() => {
    const fetchRtmklikData = async () => {
      try {
        console.log("Fetching RTMKlik data...");
        const response = await fetch("/api/rtmklik-summary");
        console.log("RTMKlik response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("RTMKlik API Response:", data);
        setRtmklikData(data);
      } catch (error) {
        console.error("Error fetching RTMKlik data:", error);
        console.error("Full error details:", error.message);
      }
    };

    fetchRtmklikData();
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
        latestMonth: null,
        latestYear: null,
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
        latestMonth: mytvData.latestMonth || null,
        latestYear: mytvData.latestYear || null,
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
      latestMonth: mytvData.latestMonth || null,
      latestYear: mytvData.latestYear || null,
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
        latestDate: null,
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
      latestDate: data.latestDate || null,
    };
  }, [portalBeritaData]);

  // Calculate Astro metrics
  const astroMetrics = useMemo(() => {
    console.log("Calculating Astro metrics...");
    console.log("Astro data:", astroData);
    console.log("Astro data success:", astroData?.success);
    console.log("Astro data array:", astroData?.data);
    console.log("Astro data length:", astroData?.data?.length);
    console.log("Astro latest date:", astroData?.latestDate);

    if (
      !astroData?.success ||
      !astroData?.data ||
      astroData.data.length === 0
    ) {
      console.log("Astro data not available, returning default values");
      return {
        hasData: false,
        topRatedTVChannel: { name: "No data", rating: 0 },
        topRatedRadioChannel: { name: "No data", rating: 0 },
        totalTVReach: 0,
        totalRadioReach: 0,
        latestDate: null,
      };
    }

    const records = astroData.data;
    console.log("Astro records:", records);
    console.log("First record:", records[0]);

    // Separate rating and reach records - using metricType (camelCase) instead of metric_type
    const ratingRecords = records.filter((r) => r.metricType === "rating");
    const reachRecords = records.filter((r) => r.metricType === "reach");

    console.log("Rating records count:", ratingRecords.length);
    console.log("Reach records count:", reachRecords.length);
    console.log("Sample rating record:", ratingRecords[0]);
    console.log("Sample reach record:", reachRecords[0]);

    // Helper function to determine channel type based on channel name
    const getChannelType = (channelName) => {
      if (!channelName) return null;
      const upperName = channelName.toUpperCase();
      if (upperName.includes("FM")) return "radio";
      if (upperName.includes("TV")) return "tv";
      return null;
    };

    // Separate TV and Radio records based on channel name
    const tvRatingRecords = ratingRecords.filter(
      (r) => getChannelType(r.channel) === "tv"
    );
    const radioRatingRecords = ratingRecords.filter(
      (r) => getChannelType(r.channel) === "radio"
    );
    const tvReachRecords = reachRecords.filter(
      (r) => getChannelType(r.channel) === "tv"
    );
    const radioReachRecords = reachRecords.filter(
      (r) => getChannelType(r.channel) === "radio"
    );

    console.log("TV Rating records count:", tvRatingRecords.length);
    console.log("Radio Rating records count:", radioRatingRecords.length);
    console.log("TV Reach records count:", tvReachRecords.length);
    console.log("Radio Reach records count:", radioReachRecords.length);

    // Calculate top rated TV channel (highest rating value)
    const topRatedTV =
      tvRatingRecords.length > 0
        ? tvRatingRecords.reduce(
            (max, record) => (record.value > max.value ? record : max),
            tvRatingRecords[0]
          )
        : { channel: "No data", value: 0 };

    console.log("Top rated TV channel:", topRatedTV);

    // Calculate top rated Radio channel (highest rating value)
    const topRatedRadio =
      radioRatingRecords.length > 0
        ? radioRatingRecords.reduce(
            (max, record) => (record.value > max.value ? record : max),
            radioRatingRecords[0]
          )
        : { channel: "No data", value: 0 };

    console.log("Top rated Radio channel:", topRatedRadio);

    // Calculate total TV reach
    const totalTVReach = tvReachRecords.reduce(
      (sum, record) => sum + (record.value || 0),
      0
    );

    console.log("Total TV reach:", totalTVReach);

    // Calculate total Radio reach
    const totalRadioReach = radioReachRecords.reduce(
      (sum, record) => sum + (record.value || 0),
      0
    );

    console.log("Total Radio reach:", totalRadioReach);

    const result = {
      hasData: true,
      topRatedTVChannel: {
        name: topRatedTV.channel,
        rating: topRatedTV.value,
      },
      topRatedRadioChannel: {
        name: topRatedRadio.channel,
        rating: topRatedRadio.value,
      },
      totalTVReach,
      totalRadioReach,
      latestDate: astroData.latestDate,
    };

    console.log("Final Astro metrics:", result);

    return result;
  }, [astroData]);

  // Calculate RTMKlik metrics
  const rtmklikMetrics = useMemo(() => {
    console.log("Calculating RTMKlik metrics...");
    console.log("RTMKlik data:", rtmklikData);

    if (!rtmklikData?.success || !rtmklikData?.data) {
      console.log("RTMKlik data not available, returning default values");
      return {
        hasData: false,
        totalActiveUsers: 0,
        topRegion: { name: "No data", users: 0 },
        topChannel: { name: "No data", users: 0 },
        totalPageViews: 0,
        latestDate: null,
      };
    }

    const { data } = rtmklikData;
    console.log("RTMKlik data summary:", data);

    return {
      hasData: data.hasData,
      totalActiveUsers: data.totalActiveUsers,
      formattedTotalActiveUsers: data.formattedTotalActiveUsers,
      topRegion: data.topRegion,
      topChannel: data.topChannel,
      totalPageViews: data.totalPageViews,
      formattedTotalPageViews: data.formattedTotalPageViews,
      latestDate: data.latestDate || null,
    };
  }, [rtmklikData]);

  // Platform data structure
  const platforms = [
    {
      id: "rtmklik",
      name: "RTMKlik",
      icon: (
        <Image
          src="/multiplatform-logos/new-size-rtmklik.png"
          alt="RTMKlik Logo"
          width={64}
          height={64}
          className="object-contain"
        />
      ),
      color: "from-amber-500 to-amber-600",
      borderColor: "border-amber-200",
      bgColor: "bg-amber-50",
      textColor: "text-amber-900",
      link: "/RTMKlik",
      hasData: rtmklikMetrics.hasData,
      metrics: {
        mau: rtmklikMetrics.hasData
          ? rtmklikMetrics.formattedTotalActiveUsers
          : "No data available yet",
        totalHours: rtmklikMetrics.hasData
          ? `${rtmklikMetrics.topRegion.name} (${rtmklikMetrics.topRegion.formattedUsers})`
          : "No data available yet",
        avgHours: rtmklikMetrics.hasData
          ? `${rtmklikMetrics.topChannel.name}`
          : "No data available yet",
        topChannel: rtmklikMetrics.hasData
          ? rtmklikMetrics.formattedTotalPageViews
          : "No data available yet",
      },
    },
    {
      id: "mytv",
      name: "MyTV",
      icon: (
        <Image
          src="/multiplatform-logos/new-size-mytv.png"
          alt="MyTV Logo"
          width={64}
          height={64}
          className="object-contain"
        />
      ),
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
      id: "astro",
      name: "ASTRO",
      icon: (
        <Image
          src="/multiplatform-logos/new-size-astro.png"
          alt="ASTRO Logo"
          width={64}
          height={64}
          className="object-contain"
        />
      ),
      color: "from-purple-500 to-purple-600",
      borderColor: "border-purple-200",
      bgColor: "bg-purple-50",
      textColor: "text-purple-900",
      link: "/ASTRO",
      hasData: astroMetrics.hasData,
      metrics: {
        mau: astroMetrics.hasData
          ? `${astroMetrics.topRatedTVChannel.name} (${astroMetrics.topRatedTVChannel.rating})`
          : "No data available yet",
        totalHours: astroMetrics.hasData
          ? `${astroMetrics.totalTVReach.toLocaleString()}`
          : "No data available yet",
        avgHours: astroMetrics.hasData
          ? `${astroMetrics.topRatedRadioChannel.name} (${astroMetrics.topRatedRadioChannel.rating})`
          : "No data available yet",
        topChannel: astroMetrics.hasData
          ? `${astroMetrics.totalRadioReach.toLocaleString()}`
          : "No data available yet",
      },
    },
    {
      id: "unifitv",
      name: "UnifiTV",
      icon: (
        <Image
          src="/multiplatform-logos/new-size-unifitv.png"
          alt="UnifiTV Logo"
          width={64}
          height={64}
          className="object-contain"
        />
      ),
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
        topChannelAvgViewers: unifiMetrics.topChannel.avgViewers,
      },
    },
    {
      id: "wartaberita",
      name: "Portal Berita",
      icon: (
        <Image
          src="/multiplatform-logos/new-size-portalberita.png"
          alt="Portal Berita Logo"
          width={64}
          height={64}
          className="object-contain"
        />
      ),
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
              {/* Updated Date */}
              <div className="text-center text-xs text-gray-400 mb-3">
                Updated as of:{" "}
                {mytvMetrics.latestMonth && mytvMetrics.latestYear
                  ? (() => {
                      // Convert month number to month name
                      const monthNames = [
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ];
                      const monthIndex = parseInt(mytvMetrics.latestMonth) - 1;
                      const monthName =
                        monthNames[monthIndex] || mytvMetrics.latestMonth;
                      return `${monthName} ${mytvMetrics.latestYear}`;
                    })()
                  : new Date().toLocaleDateString("en-MY", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Image
                    src="/multiplatform-logos/new-size-mytv.png"
                    alt="MyTV Logo"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                  <CardTitle className="text-xl font-bold text-gray-900">
                    MyTV
                  </CardTitle>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Left side: Main stats */}
                <div className="flex-1 space-y-3">
                  {/* Total Viewers */}
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-gray-700" />
                      <span className="text-xs font-semibold text-gray-700 tracking-wide">
                        Total Viewers for All TV Channels (Viewers)
                      </span>
                    </div>
                    <div className="text-l font-bold text-gray-900">
                      {mytvMetrics.totalViewers.toLocaleString()}
                    </div>
                  </div>

                  {/* Primary Highlight - Top Channel */}
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <Trophy className="h-4 w-4 text-gray-700" />
                      <span className="text-xs font-semibold text-gray-700">
                        Top Channel
                      </span>
                    </div>
                    <div className="text-base font-bold text-gray-900 leading-tight mb-1">
                      {mytvMetrics.topChannel.name} ({" "}
                      {mytvMetrics.topChannel.audienceShare})
                    </div>
                    <div className="text-base font-bold text-gray-900 mb-1"></div>
                    <div className="text-xs font-medium text-gray-600">
                      Purata Penonton: {mytvMetrics.topChannel.avgViewers}
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
              {/* Updated Date */}
              <div className="text-center text-xs text-gray-400 mb-3">
                Updated as of: 2024
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                    <DollarSign className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Marketing Revenue
                  </CardTitle>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Saluran Cards Grid - TV, BES, Radio, Total */}
              <div className="grid grid-cols-2 gap-3">
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
              {/* Updated Date */}
              <div className="text-center text-xs text-gray-400 mb-3">
                Updated as of:{" "}
                {portalBeritaMetrics.latestDate
                  ? new Date(portalBeritaMetrics.latestDate).toLocaleDateString(
                      "en-MY",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : new Date().toLocaleDateString("en-MY", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Image
                    src="/multiplatform-logos/new-size-portalberita.png"
                    alt="Portal Berita Logo"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Portal Berita
                  </CardTitle>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
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

    // Special layout for ASTRO with enhanced analytics
    if (platform.id === "astro" && hasAnyData && astroMetrics.hasData) {
      return (
        <Link href={platform.link} className="block group">
          <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              {/* Updated Date */}
              <div className="text-center text-xs text-gray-400 mb-3">
                Updated as of:{" "}
                {astroMetrics.latestDate
                  ? new Date(astroMetrics.latestDate).toLocaleDateString(
                      "en-MY",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "N/A"}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Image
                    src="/multiplatform-logos/new-size-astro.png"
                    alt="ASTRO Logo"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                  <CardTitle className="text-xl font-bold text-gray-900">
                    ASTRO
                  </CardTitle>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ASTRO Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Top TV Channel (Rating) - Top Left */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Star className="h-3 w-3 text-gray-700" />
                    <span className="text-xs font-semibold text-gray-900">
                      Top TV Channel (Rating)
                    </span>
                  </div>
                  <div
                    className="text-sm font-bold text-gray-900 mb-1 truncate"
                    title={astroMetrics.topRatedTVChannel.name}
                  >
                    {astroMetrics.topRatedTVChannel.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Rating: {astroMetrics.topRatedTVChannel.rating}
                  </div>
                </div>

                {/* Total Viewer TV (Reach) - Top Right */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="h-3 w-3 text-gray-700" />
                    <span className="text-xs font-semibold text-gray-900">
                      Total Viewer TV (Reach)
                    </span>
                  </div>
                  <div
                    className="text-sm font-bold text-gray-900 mb-1"
                    title={astroMetrics.totalTVReach.toLocaleString()}
                  >
                    {astroMetrics.totalTVReach.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Viewers</div>
                </div>

                {/* Top Radio Channel (Rating) - Bottom Left */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Trophy className="h-3 w-3 text-gray-700" />
                    <span className="text-xs font-semibold text-gray-900">
                      Top Radio Channel (Rating)
                    </span>
                  </div>
                  <div
                    className="text-sm font-bold text-gray-900 mb-1 truncate"
                    title={astroMetrics.topRatedRadioChannel.name}
                  >
                    {astroMetrics.topRatedRadioChannel.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Rating: {astroMetrics.topRatedRadioChannel.rating}
                  </div>
                </div>

                {/* Total Listener Radio (Reach) - Bottom Right */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="h-3 w-3 text-gray-700" />
                    <span className="text-xs font-semibold text-gray-900">
                      Total Listener Radio (Reach)
                    </span>
                  </div>
                  <div
                    className="text-sm font-bold text-gray-900 mb-1"
                    title={astroMetrics.totalRadioReach.toLocaleString()}
                  >
                    {astroMetrics.totalRadioReach.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Listeners</div>
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

    // Special layout for RTMKlik with enhanced analytics
    if (platform.id === "rtmklik" && hasAnyData && rtmklikMetrics.hasData) {
      return (
        <Link href={platform.link} className="block group">
          <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              {/* Updated Date */}
              <div className="text-center text-xs text-gray-400 mb-3">
                Updated as of:{" "}
                {rtmklikMetrics.latestDate
                  ? new Date(rtmklikMetrics.latestDate).toLocaleDateString(
                      "en-MY",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "N/A"}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Image
                    src="/multiplatform-logos/new-size-rtmklik.png"
                    alt="RTMKlik Logo"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                  <CardTitle className="text-xl font-bold text-gray-900">
                    RTMKlik
                  </CardTitle>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* RTMKlik Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Total Viewers for All TV and Radio Channels (MAU) - Top Left */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="h-3 w-3 text-gray-700" />
                    <span className="text-xs font-semibold text-gray-900">
                      Total Viewers (MAU)
                    </span>
                  </div>
                  <div
                    className="text-sm font-bold text-gray-900 mb-1"
                    title={rtmklikMetrics.formattedTotalActiveUsers}
                  >
                    {rtmklikMetrics.formattedTotalActiveUsers}
                  </div>
                  <div className="text-xs text-gray-500">
                    TV + Radio Channels
                  </div>
                </div>

                {/* Top Region (TV+Radio MAU) - Top Right */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Trophy className="h-3 w-3 text-gray-700" />
                    <span className="text-xs font-semibold text-gray-900">
                      Top Region
                    </span>
                  </div>
                  <div
                    className="text-sm font-bold text-gray-900 mb-1 truncate"
                    title={rtmklikMetrics.topRegion.name}
                  >
                    {rtmklikMetrics.topRegion.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {rtmklikMetrics.topRegion.formattedUsers} users
                  </div>
                </div>

                {/* Top Channel - Bottom Left */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Star className="h-3 w-3 text-gray-700" />
                    <span className="text-xs font-semibold text-gray-900">
                      Top Channel
                    </span>
                  </div>
                  <div
                    className="text-sm font-bold text-gray-900 mb-1 truncate"
                    title={rtmklikMetrics.topChannel.name}
                  >
                    {rtmklikMetrics.topChannel.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {rtmklikMetrics.topChannel.formattedUsers} MAU
                  </div>
                </div>

                {/* Total Page Views - Bottom Right */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="h-3 w-3 text-gray-700" />
                    <span className="text-xs font-semibold text-gray-900">
                      Total Page Views
                    </span>
                  </div>
                  <div
                    className="text-sm font-bold text-gray-900 mb-1"
                    title={rtmklikMetrics.formattedTotalPageViews}
                  >
                    {rtmklikMetrics.formattedTotalPageViews}
                  </div>
                  <div className="text-xs text-gray-500">Screen/Page Views</div>
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
        key: "mau",
        icon:
          platform.id === "astro" ? (
            <Star className="h-4 w-4 text-gray-700" />
          ) : (
            <Users className="h-4 w-4 text-gray-700" />
          ),
        label:
          platform.id === "marketing" ? (
            "Total Revenue"
          ) : platform.id === "astro" ? (
            "Top Rated Channel"
          ) : platform.id === "unifitv" ? (
            <>
              Total Viewers for All TV Channels <br /> (MAU)
            </>
          ) : (
            "MAU"
          ),
        value: platform.metrics.mau,
        show:
          platform.metrics.mau !== "No data" && platform.metrics.mau !== "N/A",
      },
      {
        key: "totalHours",
        icon:
          platform.id === "astro" ? (
            <TrendingUp className="h-4 w-4 text-gray-700" />
          ) : (
            <Clock className="h-4 w-4 text-gray-700" />
          ),
        label:
          platform.id === "marketing"
            ? "Saluran"
            : platform.id === "astro"
            ? "Top Reach Channel"
            : "Hours",
        value: platform.metrics.totalHours,
        show:
          platform.metrics.totalHours !== "No data" &&
          platform.metrics.totalHours !== "N/A",
      },
      {
        key: "topChannel",
        icon: <Trophy className="h-4 w-4 text-gray-700" />,
        label:
          platform.id === "marketing"
            ? "Top Saluran"
            : platform.id === "astro"
            ? "Lowest Rating Channel"
            : "Top Channel",
        value: platform.metrics.topChannel,
        show:
          platform.metrics.topChannel !== "No data" &&
          platform.metrics.topChannel !== "N/A",
      },
      {
        key: "avgHours",
        icon:
          platform.id === "astro" ? (
            <Users className="h-4 w-4 text-gray-700" />
          ) : (
            <TrendingUp className="h-4 w-4 text-gray-700" />
          ),
        label:
          platform.id === "marketing"
            ? "YoY Change"
            : platform.id === "astro"
            ? "Total Reach"
            : "Average Hours User Watched",
        value:
          platform.id === "marketing"
            ? platform.metrics.avgHours
            : platform.id === "astro"
            ? platform.metrics.avgHours
            : platform.metrics.avgHours !== "N/A"
            ? `${platform.metrics.avgHours}h`
            : platform.metrics.avgHours,
        show:
          platform.metrics.avgHours !== "No data" &&
          platform.metrics.avgHours !== "N/A",
      },
    ].filter((metric) => metric.show);

    return (
      <Link href={platform.link} className="block group">
        <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            {/* Updated Date - Only for UnifiTV */}
            {platform.id === "unifitv" && (
              <div className="text-center text-xs text-gray-400 mb-3">
                Updated as of:{" "}
                {unifiData?.data?.latestDate
                  ? new Date(unifiData.data.latestDate).toLocaleDateString(
                      "en-MY",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : new Date().toLocaleDateString("en-MY", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {platform.icon}
                <CardTitle className="text-xl font-bold text-gray-900">
                  {platform.name}
                </CardTitle>
              </div>
              <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
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
                          <div className="flex flex-col">
                            <span className="text-sm">{metric.value}</span>
                            {platform.id === "unifitv" &&
                              platform.metrics.topChannelAvgViewers > 0 && (
                                <span className="text-xs font-medium text-gray-600">
                                  Purata Penonton:{" "}
                                  {platform.metrics.topChannelAvgViewers.toLocaleString()}
                                </span>
                              )}
                          </div>
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
    <div className="p-6 max-w-7xl mx-auto space-y-6 pt-24">
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

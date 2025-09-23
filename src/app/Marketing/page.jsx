"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  BarChart3,
  Users,
  Activity,
  Zap,
} from "lucide-react";
import { useMarketingData } from "@/hooks/useMarketingData";
import { useTVMonthlyData } from "@/hooks/useTVMonthlyData";
import { useMarketingTable2Data } from "@/hooks/useMarketingTable2Data";
import MarketingIncomeComparisonChart from "@/components/Marketing/MarketingIncomeComparisonChart";
import MarketingPerformanceTable from "@/components/Marketing/MarketingPerformanceTable";
import MarketingChannelBreakdownTable from "@/components/Marketing/MarketingChannelBreakdownTable";
import TVMonthlyPerformanceChart from "@/components/Marketing/TVMonthlyPerformanceChart";
import Header from "@/components/Header";

const MarketingDashboard = () => {
  const { data: marketingData, isLoading, error } = useMarketingData();
  const {
    data: tvMonthlyData,
    isLoading: tvLoading,
    error: tvError,
  } = useTVMonthlyData();
  const {
    data: table2Data,
    isLoading: table2Loading,
    error: table2Error,
  } = useMarketingTable2Data();

  // Debug: Log the marketing data
  console.log("Marketing dashboard received data:", marketingData);
  console.log("TV monthly data:", tvMonthlyData);
  console.log("Table 2 data:", table2Data);

  if (isLoading || tvLoading || table2Loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Header />
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Loading Marketing Dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (
    error ||
    !marketingData?.success ||
    tvError ||
    !tvMonthlyData?.success ||
    table2Error ||
    !table2Data?.success
  ) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Header />
        <div className="flex items-center justify-center min-h-96">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error Loading Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">
                Failed to load marketing data. Please try again later.
              </p>
              {tvError && (
                <p className="text-red-600 mt-2">
                  TV monthly data failed to load.
                </p>
              )}
              {table2Error && (
                <p className="text-red-600 mt-2">
                  Channel breakdown data failed to load.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { summary, saluranMetrics } = marketingData.data;
  const { chartData: tvChartData, summary: tvSummary } = tvMonthlyData.data;

  // Format number for display
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  // Get trend icon and color
  const getTrendIcon = (direction, change) => {
    if (direction === "increase") {
      return {
        icon: TrendingUp,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    } else if (direction === "decrease") {
      return {
        icon: TrendingDown,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      };
    } else {
      return {
        icon: Activity,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
      };
    }
  };

  const overallTrend = getTrendIcon(
    summary.overallDirection,
    summary.overallChange
  );
  const OverallTrendIcon = overallTrend.icon;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Header />

      <div className="pt-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Marketing Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of marketing channel performance and revenue
            breakdown
          </p>
        </div>

        {/* Yearly Performance Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight mb-6 text-center">
            Yearly Performance
          </h2>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Income Comparison Chart */}
            <MarketingIncomeComparisonChart data={saluranMetrics} />

            {/* Performance Table */}
            <MarketingPerformanceTable data={saluranMetrics} />
          </div>
        </div>

        {/* TV Performance Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold tracking-tight mb-6 text-center font-sans">
            COMPARISON OF TV REVENUE FOR THE CURRENT DATE (1 JANUARY – 31
            DECEMBER) <br /> YEAR 2022, 2023, 2024
          </h2>

          {/* TV Charts Row */}
          <div className="grid gap-6 lg:grid-cols-1">
            <TVMonthlyPerformanceChart data={tvChartData} />
          </div>
        </div>

        {/* Channel Breakdown Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold tracking-tight mb-6 text-center font-sans">
            COMPARISON OF RADIO REVENUE FOR THE CURRENT DATE (1 JANUARY – 31
            DECEMBER) <br /> YEAR 2022, 2023, 2024
          </h2>

          {/* Radio Charts Row */}
          <div className="grid gap-6 lg:grid-cols-1">
            <MarketingChannelBreakdownTable data={table2Data?.data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;

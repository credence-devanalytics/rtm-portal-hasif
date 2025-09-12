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
import MarketingIncomeComparisonChart from "@/components/Marketing/MarketingIncomeComparisonChart";
import MarketingPerformanceTable from "@/components/Marketing/MarketingPerformanceTable";
import Header from "@/components/Header";

const MarketingDashboard = () => {
  const { data: marketingData, isLoading, error } = useMarketingData();

  // Debug: Log the marketing data
  console.log("Marketing dashboard received data:", marketingData);

  if (isLoading) {
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

  if (error || !marketingData?.success) {
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
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { summary, saluranMetrics } = marketingData.data;

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

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mt-6">
          {/* Total Current Revenue */}
          <Card className="">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue 2024
              </CardTitle>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {summary.formattedTotalCurrent}
              </div>
              <p className="text-xs text-gray-600 mt-1">Current year total</p>
            </CardContent>
          </Card>

          {/* Total Previous Revenue */}
          <Card className="">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue 2023
              </CardTitle>
              <BarChart3 className="h-5 w-5 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {summary.formattedTotalPrevious}
              </div>
              <p className="text-xs text-gray-600 mt-1">Previous year total</p>
            </CardContent>
          </Card>

          {/* Total 2022 Revenue */}
          <Card className="">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue 2022
              </CardTitle>
              <Users className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900">
                {summary.formattedTotal2022}
              </div>
              <p className="text-xs text-gray-600 mt-1">2022 total</p>
            </CardContent>
          </Card>

          {/* Overall Change */}
          <Card
            className={`${overallTrend.bgColor} ${overallTrend.borderColor}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className={`text-sm font-medium ${overallTrend.color}`}
              >
                Year-over-Year Change
              </CardTitle>
              <OverallTrendIcon className={`h-5 w-5 ${overallTrend.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${overallTrend.color}`}>
                {summary.overallChange > 0 ? "+" : ""}
                {summary.overallChange}%
              </div>
              <p className={`text-xs ${overallTrend.color} mt-1 capitalize`}>
                {summary.overallDirection.replace("_", " ")}
              </p>
            </CardContent>
          </Card>

          {/* Active Channels */}
          <Card className="">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Channels
              </CardTitle>
              <Target className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {summary.activeSaluran}
              </div>
              <p className="text-xs text-gray-600 mt-1">Marketing channels</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          {/* Income Comparison Chart */}
          <MarketingIncomeComparisonChart data={saluranMetrics} />

          {/* Performance Table */}
          <MarketingPerformanceTable data={saluranMetrics} />
        </div>

        {/* Top Performing Channels Table */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Channel Performance Breakdown
              </CardTitle>
              <p className="text-sm text-gray-600">
                Detailed comparison of all marketing channels
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Channel</th>
                      <th className="text-right p-3">2022 Revenue</th>
                      <th className="text-right p-3">2023 Revenue</th>
                      <th className="text-right p-3">2024 Revenue</th>
                      <th className="text-right p-3">Change</th>
                      <th className="text-center p-3">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saluranMetrics.map((channel, index) => {
                      const trend = getTrendIcon(
                        channel.changeDirection,
                        channel.percentageChange
                      );
                      const TrendIcon = trend.icon;

                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{channel.saluran}</td>
                          <td className="p-3 text-right">
                            {channel.formatted2022Value}
                          </td>
                          <td className="p-3 text-right">
                            {channel.formattedPreviousValue}
                          </td>
                          <td className="p-3 text-right">
                            {channel.formattedCurrentValue}
                          </td>
                          <td
                            className={`p-3 text-right font-semibold ${trend.color}`}
                          >
                            {channel.formattedChange}
                          </td>
                          <td className="p-3 text-center">
                            <TrendIcon
                              className={`h-4 w-4 mx-auto ${trend.color}`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;

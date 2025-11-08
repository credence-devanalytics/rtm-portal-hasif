"use client";
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface MarketingChannelBreakdownTableProps {
  data: any;
  selectedYear?: string;
}

const MarketingChannelBreakdownTable = ({ data, selectedYear = "all" }: MarketingChannelBreakdownTableProps) => {
  const [sortConfig, setSortConfig] = useState({
    key: "year2024",
    direction: "desc",
  });

  // Determine if we should show growth columns
  const showGrowthColumns = selectedYear === "all";

  if (!data || !data.channels) {
    return (
      <Card className="">
        <CardHeader className="">
          <CardTitle className="text-lg font-bold font-sans">
            Channel Revenue Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground font-sans">
              No data available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { channels, totals } = data;

  // Determine which years have data
  const availableYears = useMemo(() => {
    const years = {
      2022: channels.some((ch: any) => ch.year2022 && ch.year2022 > 0),
      2023: channels.some((ch: any) => ch.year2023 && ch.year2023 > 0),
      2024: channels.some((ch: any) => ch.year2024 && ch.year2024 > 0),
    };
    return years;
  }, [channels]);

  // Function to get trend icon and color
  const getTrendIcon = (value) => {
    if (value > 0) {
      return {
        icon: TrendingUp,
        color: "text-green-600",
        text: `+${value}%`,
      };
    } else if (value < 0) {
      return {
        icon: TrendingDown,
        color: "text-red-600",
        text: `${value}%`,
      };
    } else {
      return {
        icon: Minus,
        color: "text-gray-500",
        text: "0%",
      };
    }
  };

  // Sort function
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <ArrowUpDown className="inline-block ml-1 h-3 w-3 text-gray-400" />
      );
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline-block ml-1 h-3 w-3 text-blue-600" />
    ) : (
      <ArrowDown className="inline-block ml-1 h-3 w-3 text-blue-600" />
    );
  };

  // Sort channels based on sortConfig
  const sortedChannels = useMemo(() => {
    const sorted = [...channels].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case "channel":
          aValue = a.channel.toLowerCase();
          bValue = b.channel.toLowerCase();
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        case "year2022":
          aValue = a.year2022 || 0;
          bValue = b.year2022 || 0;
          break;
        case "year2023":
          aValue = a.year2023 || 0;
          bValue = b.year2023 || 0;
          break;
        case "year2024":
          aValue = a.year2024 || 0;
          bValue = b.year2024 || 0;
          break;
        case "growth2022to2023":
          aValue = a.growth2022to2023 || 0;
          bValue = b.growth2022to2023 || 0;
          break;
        case "growth2023to2024":
          aValue = a.growth2023to2024 || 0;
          bValue = b.growth2023to2024 || 0;
          break;
        default:
          return 0;
      }

      if (sortConfig.direction === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return sorted;
  }, [channels, sortConfig]);

  return (
    <Card className="">
      <CardHeader className="">
        <CardTitle className="text-lg font-bold font-sans">
          Channel Revenue Breakdown (2022-2024)
        </CardTitle>
        <p className="text-sm text-muted-foreground font-sans">
          Revenue comparison across TV channels with growth percentages
        </p>
      </CardHeader>
      <CardContent className="">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-gray-200">
                <th
                  className="text-left py-3 px-2 font-bold text-sm text-gray-700 font-sans cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("channel")}
                >
                  Channel {getSortIcon("channel")}
                </th>
                {availableYears[2022] && (
                  <th
                    className="text-right py-3 px-2 font-bold text-sm text-gray-700 font-sans cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("year2022")}
                  >
                    2022 {getSortIcon("year2022")}
                  </th>
                )}
                {showGrowthColumns && availableYears[2022] && availableYears[2023] && (
                  <th
                    className="text-center py-3 px-2 font-bold text-sm text-gray-700 font-sans cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("growth2022to2023")}
                  >
                    2022-2023 {getSortIcon("growth2022to2023")}
                  </th>
                )}
                {availableYears[2023] && (
                  <th
                    className="text-right py-3 px-2 font-bold text-sm text-gray-700 font-sans cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("year2023")}
                  >
                    2023 {getSortIcon("year2023")}
                  </th>
                )}
                {showGrowthColumns && availableYears[2023] && availableYears[2024] && (
                  <th
                    className="text-center py-3 px-2 font-bold text-sm text-gray-700 font-sans cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("growth2023to2024")}
                  >
                    2023-2024 {getSortIcon("growth2023to2024")}
                  </th>
                )}
                {availableYears[2024] && (
                  <th
                    className="text-right py-3 px-2 font-bold text-sm text-gray-700 font-sans cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("year2024")}
                  >
                    2024 {getSortIcon("year2024")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedChannels.map((channel, index) => {
                const trend2022to2023 = getTrendIcon(channel.growth2022to2023);
                const trend2023to2024 = getTrendIcon(channel.growth2023to2024);
                const TrendIcon2022to2023 = trend2022to2023.icon;
                const TrendIcon2023to2024 = trend2023to2024.icon;

                return (
                  <tr
                    key={channel.channel}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-25"
                    }`}
                  >
                    <td className="py-3 px-2 font-medium text-gray-900">
                      {channel.channel}
                    </td>
                    {availableYears[2022] && (
                      <td className="py-3 px-2 text-right text-gray-700">
                        {channel.formatted2022}
                      </td>
                    )}
                    {showGrowthColumns && availableYears[2022] && availableYears[2023] && (
                      <td className="py-3 px-2 text-center">
                        <div
                          className={`flex items-center justify-center gap-1 ${trend2022to2023.color}`}
                        >
                          <TrendIcon2022to2023 className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {trend2022to2023.text}
                          </span>
                        </div>
                      </td>
                    )}
                    {availableYears[2023] && (
                      <td className="py-3 px-2 text-right text-gray-700">
                        {channel.formatted2023}
                      </td>
                    )}
                    {showGrowthColumns && availableYears[2023] && availableYears[2024] && (
                      <td className="py-3 px-2 text-center">
                        <div
                          className={`flex items-center justify-center gap-1 ${trend2023to2024.color}`}
                        >
                          <TrendIcon2023to2024 className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {trend2023to2024.text}
                          </span>
                        </div>
                      </td>
                    )}
                    {availableYears[2024] && (
                      <td className="py-3 px-2 text-right text-gray-700">
                        {channel.formatted2024}
                      </td>
                    )}
                  </tr>
                );
              })}

              {/* Totals Row */}
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                <td className="py-4 px-2 text-gray-900 font-bold">
                  {totals.channel}
                </td>
                {availableYears[2022] && (
                  <td className="py-4 px-2 text-right text-gray-900">
                    {totals.formatted2022}
                  </td>
                )}
                {showGrowthColumns && availableYears[2022] && availableYears[2023] && (
                  <td className="py-4 px-2 text-center">
                    <div
                      className={`flex items-center justify-center gap-1 ${
                        getTrendIcon(totals.growth2022to2023).color
                      }`}
                    >
                      {React.createElement(
                        getTrendIcon(totals.growth2022to2023).icon,
                        { className: "h-3 w-3" }
                      )}
                      <span className="text-xs font-bold">
                        {getTrendIcon(totals.growth2022to2023).text}
                      </span>
                    </div>
                  </td>
                )}
                {availableYears[2023] && (
                  <td className="py-4 px-2 text-right text-gray-900">
                    {totals.formatted2023}
                  </td>
                )}
                {showGrowthColumns && availableYears[2023] && availableYears[2024] && (
                  <td className="py-4 px-2 text-center">
                    <div
                      className={`flex items-center justify-center gap-1 ${
                        getTrendIcon(totals.growth2023to2024).color
                      }`}
                    >
                      {React.createElement(
                        getTrendIcon(totals.growth2023to2024).icon,
                        { className: "h-3 w-3" }
                      )}
                      <span className="text-xs font-bold">
                        {getTrendIcon(totals.growth2023to2024).text}
                      </span>
                    </div>
                  </td>
                )}
                {availableYears[2024] && (
                  <td className="py-4 px-2 text-right text-gray-900">
                    {totals.formatted2024}
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketingChannelBreakdownTable;

"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface RadioChannelBreakdownTableProps {
  data: any;
  selectedYear?: string;
}

const RadioChannelBreakdownTable = ({ data, selectedYear = "all" }: RadioChannelBreakdownTableProps) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Determine if we should show growth columns
  const showGrowthColumns = selectedYear === "all";

  // Detect which years have data across all channel groups
  const availableYears = useMemo(() => {
    if (!data) return { 2022: false, 2023: false, 2024: false };
    
    // Get all channels from all groups
    const allChannels = Object.values(data).flatMap((group: any) => group.channels || []);
    
    return {
      2022: allChannels.some((ch: any) => ch[2022] && ch[2022] > 0),
      2023: allChannels.some((ch: any) => ch[2023] && ch[2023] > 0),
      2024: allChannels.some((ch: any) => ch[2024] && ch[2024] > 0),
    };
  }, [data]);

  if (!data) {
    return (
      <Card className="">
        <CardHeader className="">
          <CardTitle className="">Radio Channel Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="">
          <div className="flex items-center justify-center py-8">
            <p className="text-base text-gray-500 font-sans">
              No radio channel data available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format currency
  const formatCurrency = (value) => {
    if (value === 0) return "RM 0";
    return `RM ${value.toLocaleString()}`;
  };

  // Format percentage with color
  const formatPercentage = (value) => {
    if (value === "N/A")
      return <span className="text-sm text-gray-400 font-sans">N/A</span>;
    const numValue = parseFloat(value);
    const colorClass = numValue >= 0 ? "text-green-600" : "text-red-600";
    const symbol = numValue >= 0 ? "+" : "";
    return (
      <span className={`text-xs font-medium font-sans ${colorClass}`}>
        {symbol}
        {value}%
      </span>
    );
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

  // Sort channels within a group
  const sortChannels = (channels) => {
    if (!sortConfig.key) return channels;

    // Separate total row from regular channels
    const totalRow = channels.find((ch) => ch.isTotal);
    const regularChannels = channels.filter((ch) => !ch.isTotal);

    const sorted = [...regularChannels].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case "channel":
          aValue = a.channel.toLowerCase();
          bValue = b.channel.toLowerCase();
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        case "year2022":
          aValue = a[2022] || 0;
          bValue = b[2022] || 0;
          break;
        case "year2023":
          aValue = a[2023] || 0;
          bValue = b[2023] || 0;
          break;
        case "year2024":
          aValue = a[2024] || 0;
          bValue = b[2024] || 0;
          break;
        case "growth2022to2023":
          aValue =
            a.growth2022to2023 === "N/A"
              ? -Infinity
              : parseFloat(a.growth2022to2023);
          bValue =
            b.growth2022to2023 === "N/A"
              ? -Infinity
              : parseFloat(b.growth2022to2023);
          break;
        case "growth2023to2024":
          aValue =
            a.growth2023to2024 === "N/A"
              ? -Infinity
              : parseFloat(a.growth2023to2024);
          bValue =
            b.growth2023to2024 === "N/A"
              ? -Infinity
              : parseFloat(b.growth2023to2024);
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

    // Always keep total row at the end
    return totalRow ? [...sorted, totalRow] : sorted;
  };

  const renderChannelGroup = (groupName, groupData) => {
    const sortedChannels = sortChannels(groupData.channels);

    return (
      <div key={groupName} className="mb-8">
        <h4 className="text-lg font-bold text-gray-800 mb-4 px-4 py-2 bg-gray-50 rounded-t-lg border-b font-sans">
          {groupName}
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th
                  className="text-left py-3 px-4 font-semibold text-sm text-gray-700 font-sans cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort("channel")}
                >
                  Channel {getSortIcon("channel")}
                </th>
                {availableYears[2022] && (
                  <th
                    className="text-right py-3 px-4 font-semibold text-sm text-gray-700 font-sans cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("year2022")}
                  >
                    2022 {getSortIcon("year2022")}
                  </th>
                )}
                {showGrowthColumns && availableYears[2022] && availableYears[2023] && (
                  <th
                    className="text-right py-3 px-4 font-semibold text-sm text-gray-700 font-sans cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("growth2022to2023")}
                  >
                    % Growth {getSortIcon("growth2022to2023")}
                  </th>
                )}
                {availableYears[2023] && (
                  <th
                    className="text-right py-3 px-4 font-semibold text-sm text-gray-700 font-sans cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("year2023")}
                  >
                    2023 {getSortIcon("year2023")}
                  </th>
                )}
                {showGrowthColumns && availableYears[2023] && availableYears[2024] && (
                  <th
                    className="text-right py-3 px-4 font-semibold text-sm text-gray-700 font-sans cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("growth2023to2024")}
                  >
                    % Growth {getSortIcon("growth2023to2024")}
                  </th>
                )}
                {availableYears[2024] && (
                  <th
                    className="text-right py-3 px-4 font-semibold text-sm text-gray-700 font-sans cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("year2024")}
                  >
                    2024 {getSortIcon("year2024")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedChannels.map((channel, index) => (
                <tr
                  key={`${channel.channel}-${index}`}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    channel.isTotal
                      ? "bg-blue-50 font-semibold border-t-2 border-blue-200"
                      : ""
                  }`}
                >
                  <td
                    className={`py-3 px-4 font-sans ${
                      channel.isTotal ? "font-bold text-blue-800" : ""
                    }`}
                  >
                    {channel.channel}
                  </td>
                  {availableYears[2022] && (
                    <td className="text-right py-3 px-4 text-xs font-sans">
                      {formatCurrency(channel[2022])}
                    </td>
                  )}
                  {showGrowthColumns && availableYears[2022] && availableYears[2023] && (
                    <td className="text-right py-3 px-4 font-sans">
                      {formatPercentage(channel.growth2022to2023)}
                    </td>
                  )}
                  {availableYears[2023] && (
                    <td className="text-right py-3 px-4 text-xs font-sans">
                      {formatCurrency(channel[2023])}
                    </td>
                  )}
                  {showGrowthColumns && availableYears[2023] && availableYears[2024] && (
                    <td className="text-right py-3 px-4 font-sans">
                      {formatPercentage(channel.growth2023to2024)}
                    </td>
                  )}
                  {availableYears[2024] && (
                    <td className="text-right py-3 px-4 text-xs font-sans">
                      {formatCurrency(channel[2024])}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <Card className="">
      <CardHeader className="">
        <CardTitle className="text-lg font-bold font-sans">
          Radio Channel Performance Breakdown
        </CardTitle>
        <p className="text-sm text-gray-600 font-sans">
          Revenue breakdown by channel groups, sorted by total value
        </p>
      </CardHeader>
      <CardContent className="">
        <div className="space-y-6">
          {Object.entries(data).map(([groupName, groupData]) =>
            renderChannelGroup(groupName, groupData)
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RadioChannelBreakdownTable;

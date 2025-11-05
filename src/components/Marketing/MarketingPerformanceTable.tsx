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

const MarketingPerformanceTable = ({ data = [] }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Calculate percentage changes
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0; // If previous year was 0 and current > 0, it's 100% increase
    }
    return ((current - previous) / previous) * 100;
  };

  // Process data to include percentage changes
  const processedData = useMemo(() => {
    return data.map((item) => {
      const change2022to2023 = calculatePercentageChange(
        item.previousValue,
        item.year2022Value || 0
      );
      const change2023to2024 = calculatePercentageChange(
        item.currentValue,
        item.previousValue
      );

      return {
        ...item,
        change2022to2023: change2022to2023,
        change2023to2024: change2023to2024,
        formatted2022to2023: `${
          change2022to2023 >= 0 ? "+" : ""
        }${change2022to2023.toFixed(1)}%`,
        formatted2023to2024: `${
          change2023to2024 >= 0 ? "+" : ""
        }${change2023to2024.toFixed(1)}%`,
      };
    });
  }, [data]);

  // Sort function
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sort data based on sortConfig
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return processedData;

    const sorted = [...processedData].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case "channel":
          aValue = a.saluran.toLowerCase();
          bValue = b.saluran.toLowerCase();
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        case "year2022":
          aValue = a.year2022Value || 0;
          bValue = b.year2022Value || 0;
          break;
        case "year2023":
          aValue = a.previousValue;
          bValue = b.previousValue;
          break;
        case "year2024":
          aValue = a.currentValue;
          bValue = b.currentValue;
          break;
        case "growth2022to2023":
          aValue = a.change2022to2023;
          bValue = b.change2022to2023;
          break;
        case "growth2023to2024":
          aValue = a.change2023to2024;
          bValue = b.change2023to2024;
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
  }, [processedData, sortConfig]);

  // Calculate totals
  const totals = {
    year2022: sortedData.reduce(
      (sum, item) => sum + (item.year2022Value || 0),
      0
    ),
    year2023: sortedData.reduce((sum, item) => sum + item.previousValue, 0),
    year2024: sortedData.reduce((sum, item) => sum + item.currentValue, 0),
  };

  const totalChange2022to2023 = calculatePercentageChange(
    totals.year2023,
    totals.year2022
  );
  const totalChange2023to2024 = calculatePercentageChange(
    totals.year2024,
    totals.year2023
  );

  // Format currency for compact display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get trend icon and styling
  const getTrendIcon = (percentage) => {
    if (percentage > 0) {
      return {
        icon: TrendingUp,
        color: "text-green-600",
        bgColor: "bg-green-50",
      };
    } else if (percentage < 0) {
      return {
        icon: TrendingDown,
        color: "text-red-600",
        bgColor: "bg-red-50",
      };
    } else {
      return {
        icon: Minus,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
      };
    }
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

  return (
    <Card className="">
      <CardHeader className="">
        <CardTitle className="text-lg font-bold font-sans">
          Marketing Performance Analysis
        </CardTitle>
        <p className="text-sm text-gray-600 font-sans">
          Detailed breakdown with year-over-year growth percentages
        </p>
      </CardHeader>
      <CardContent className="">
        <div className="h-[400px] flex flex-col">
          {/* Table Container with fixed height */}
          <div className="flex-1 overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b-2 border-gray-200">
                    <th
                      className="text-left py-4 pr-1 pl-2 font-bold text-sm min-w-[100px] font-sans cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("channel")}
                    >
                      Channel {getSortIcon("channel")}
                    </th>
                    <th
                      className="text-right py-3 px-1 font-bold text-sm min-w-[70px] font-sans cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("year2022")}
                    >
                      2022 {getSortIcon("year2022")}
                    </th>
                    <th
                      className="text-center py-3 px-1 font-bold text-sm min-w-[60px] font-sans cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("growth2022to2023")}
                    >
                      Growth {getSortIcon("growth2022to2023")}
                    </th>
                    <th
                      className="text-right py-3 px-1 font-bold text-sm min-w-[70px] font-sans cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("year2023")}
                    >
                      2023 {getSortIcon("year2023")}
                    </th>
                    <th
                      className="text-center py-3 px-1 font-bold text-sm min-w-[60px] font-sans cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("growth2023to2024")}
                    >
                      Growth {getSortIcon("growth2023to2024")}
                    </th>
                    <th
                      className="text-right py-3 px-1 font-bold text-sm min-w-[70px] font-sans cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("year2024")}
                    >
                      2024 {getSortIcon("year2024")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((channel, index) => {
                    const trend2022to2023 = getTrendIcon(
                      channel.change2022to2023
                    );
                    const trend2023to2024 = getTrendIcon(
                      channel.change2023to2024
                    );
                    const TrendIcon2022to2023 = trend2022to2023.icon;
                    const TrendIcon2023to2024 = trend2023to2024.icon;

                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-4 pr-1 pl-2 font-medium text-sm">
                          {channel.saluran}
                        </td>
                        <td className="py-3 px-1 text-right text-sm">
                          {formatCurrency(channel.year2022Value || 0)}
                        </td>
                        <td className="py-3 px-1 text-center">
                          <span
                            className={`text-sm font-semibold ${trend2022to2023.color}`}
                          >
                            {channel.formatted2022to2023}
                          </span>
                        </td>
                        <td className="py-3 px-1 text-right text-sm">
                          {formatCurrency(channel.previousValue)}
                        </td>
                        <td className="py-3 px-1 text-center">
                          <span
                            className={`text-sm font-semibold ${trend2023to2024.color}`}
                          >
                            {channel.formatted2023to2024}
                          </span>
                        </td>
                        <td className="py-3 px-1 text-right text-sm">
                          {formatCurrency(channel.currentValue)}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Total Row */}
                  <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                    <td className="py-4 pr-1 pl-2 font-bold text-sm">TOTAL</td>
                    <td className="py-3 px-1 text-right font-bold text-sm">
                      {formatCurrency(totals.year2022)}
                    </td>
                    <td className="py-3 px-1 text-center">
                      <span
                        className={`text-sm font-bold ${
                          getTrendIcon(totalChange2022to2023).color
                        }`}
                      >
                        {totalChange2022to2023 >= 0 ? "+" : ""}
                        {totalChange2022to2023.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-1 text-right font-bold text-sm">
                      {formatCurrency(totals.year2023)}
                    </td>
                    <td className="py-3 px-1 text-center">
                      <span
                        className={`text-sm font-bold ${
                          getTrendIcon(totalChange2023to2024).color
                        }`}
                      >
                        {totalChange2023to2024 >= 0 ? "+" : ""}
                        {totalChange2023to2024.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-1 text-right font-bold text-sm">
                      {formatCurrency(totals.year2024)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Summary Stats - Moved to bottom of table */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t bg-white">
                <div className="text-center">
                  <h4 className="text-xs font-semibold text-gray-700">
                    2022 → 2023 Growth
                  </h4>
                  <div
                    className={`text-lg font-bold ${
                      getTrendIcon(totalChange2022to2023).color
                    }`}
                  >
                    {totalChange2022to2023 >= 0 ? "+" : ""}
                    {totalChange2022to2023.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-xs font-semibold text-gray-700">
                    2023 → 2024 Growth
                  </h4>
                  <div
                    className={`text-lg font-bold ${
                      getTrendIcon(totalChange2023to2024).color
                    }`}
                  >
                    {totalChange2023to2024 >= 0 ? "+" : ""}
                    {totalChange2023to2024.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketingPerformanceTable;

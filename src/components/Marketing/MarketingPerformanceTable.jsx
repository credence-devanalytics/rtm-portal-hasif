"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const MarketingPerformanceTable = ({ data = [] }) => {
  // Calculate percentage changes
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0; // If previous year was 0 and current > 0, it's 100% increase
    }
    return ((current - previous) / previous) * 100;
  };

  // Process data to include percentage changes
  const processedData = data.map((item) => {
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

  // Calculate totals
  const totals = {
    year2022: processedData.reduce(
      (sum, item) => sum + (item.year2022Value || 0),
      0
    ),
    year2023: processedData.reduce((sum, item) => sum + item.previousValue, 0),
    year2024: processedData.reduce((sum, item) => sum + item.currentValue, 0),
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Marketing Performance Analysis
        </CardTitle>
        <p className="text-sm text-gray-600">
          Detailed breakdown with year-over-year growth percentages
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] flex flex-col">
          {/* Table Container with fixed height */}
          <div className="flex-1 overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 pr-1 pl-2 font-semibold min-w-[100px]">
                      Channel
                    </th>
                    <th className="text-right py-3 px-1 font-semibold min-w-[70px]">
                      2022
                    </th>
                    <th className="text-center py-3 px-1 font-semibold min-w-[60px]">
                      Growth
                    </th>
                    <th className="text-right py-3 px-1 font-semibold min-w-[70px]">
                      2023
                    </th>
                    <th className="text-center py-3 px-1 font-semibold min-w-[60px]">
                      Growth
                    </th>
                    <th className="text-right py-3 px-1 font-semibold min-w-[70px]">
                      2024
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {processedData.map((channel, index) => {
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

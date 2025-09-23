"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const MarketingChannelBreakdownTable = ({ data }) => {
  if (!data || !data.channels) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold font-sans">
            Channel Revenue Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
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

  // Sort channels by 2024 revenue (descending)
  const sortedChannels = [...channels].sort((a, b) => b.year2024 - a.year2024);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold font-sans">
          Channel Revenue Breakdown (2022-2024)
        </CardTitle>
        <p className="text-sm text-muted-foreground font-sans">
          Revenue comparison across TV channels with growth percentages
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-bold text-sm text-gray-700 font-sans">
                  Channel
                </th>
                <th className="text-right py-3 px-2 font-bold text-sm text-gray-700 font-sans">
                  2022
                </th>
                <th className="text-center py-3 px-2 font-bold text-sm text-gray-700 font-sans">
                  2022-2023
                </th>
                <th className="text-right py-3 px-2 font-bold text-sm text-gray-700 font-sans">
                  2023
                </th>
                <th className="text-center py-3 px-2 font-bold text-sm text-gray-700 font-sans">
                  2023-2024
                </th>
                <th className="text-right py-3 px-2 font-bold text-sm text-gray-700 font-sans">
                  2024
                </th>
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
                    <td className="py-3 px-2 text-right text-gray-700">
                      {channel.formatted2022}
                    </td>
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
                    <td className="py-3 px-2 text-right text-gray-700">
                      {channel.formatted2023}
                    </td>
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
                    <td className="py-3 px-2 text-right text-gray-700">
                      {channel.formatted2024}
                    </td>
                  </tr>
                );
              })}

              {/* Totals Row */}
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                <td className="py-4 px-2 text-gray-900 font-bold">
                  {totals.channel}
                </td>
                <td className="py-4 px-2 text-right text-gray-900">
                  {totals.formatted2022}
                </td>
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
                <td className="py-4 px-2 text-right text-gray-900">
                  {totals.formatted2023}
                </td>
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
                <td className="py-4 px-2 text-right text-gray-900">
                  {totals.formatted2024}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketingChannelBreakdownTable;

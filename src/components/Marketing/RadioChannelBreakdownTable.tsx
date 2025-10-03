"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RadioChannelBreakdownTable = ({ data }) => {
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

  const renderChannelGroup = (groupName, groupData) => (
    <div key={groupName} className="mb-8">
      <h4 className="text-lg font-bold text-gray-800 mb-4 px-4 py-2 bg-gray-50 rounded-t-lg border-b font-sans">
        {groupName}
      </h4>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 font-sans">
                Channel
              </th>
              <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700 font-sans">
                2022
              </th>
              <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700 font-sans">
                % Growth
              </th>
              <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700 font-sans">
                2023
              </th>
              <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700 font-sans">
                % Growth
              </th>
              <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700 font-sans">
                2024
              </th>
            </tr>
          </thead>
          <tbody>
            {groupData.channels.map((channel, index) => (
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
                <td className="text-right py-3 px-4 text-xs font-sans">
                  {formatCurrency(channel[2022])}
                </td>
                <td className="text-right py-3 px-4 font-sans">
                  {formatPercentage(channel.growth2022to2023)}
                </td>
                <td className="text-right py-3 px-4 text-xs font-sans">
                  {formatCurrency(channel[2023])}
                </td>
                <td className="text-right py-3 px-4 font-sans">
                  {formatPercentage(channel.growth2023to2024)}
                </td>
                <td className="text-right py-3 px-4 text-xs font-sans">
                  {formatCurrency(channel[2024])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

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

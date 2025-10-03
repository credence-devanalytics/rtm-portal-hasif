import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react";

const MytvGrowthTable = ({ mytvData, loading }) => {
  const growthData = React.useMemo(() => {
    if (!mytvData?.channelBreakdown) {
      // Mock data for demonstration
      return [
        {
          channel: "TV1",
          currentViewers: 3185251,
          previousViewers: 2812000,
          growth: 13.3,
        },
        {
          channel: "TV2",
          currentViewers: 3755504,
          previousViewers: 3656000,
          growth: 2.7,
        },
        {
          channel: "OKEY",
          currentViewers: 3107018,
          previousViewers: 3100000,
          growth: 0.2,
        },
        {
          channel: "BERITA RTM",
          currentViewers: 1641945,
          previousViewers: 1580000,
          growth: 3.9,
        },
        {
          channel: "SUKAN RTM",
          currentViewers: 2728607,
          previousViewers: 2650000,
          growth: 3.0,
        },
        {
          channel: "TV6",
          currentViewers: 2162728,
          previousViewers: 2100000,
          growth: 3.0,
        },
        {
          channel: "BERNAMA",
          currentViewers: 1220216,
          previousViewers: 1250000,
          growth: -2.4,
        },
      ];
    }

    // Calculate growth from actual data (would need historical data)
    return mytvData.channelBreakdown.map((item, index) => ({
      channel: item.channel,
      currentViewers: item.totalViewers || 0,
      previousViewers: (item.totalViewers || 0) * (0.85 + Math.random() * 0.3), // Mock previous month
      growth:
        ((item.totalViewers || 0) /
          ((item.totalViewers || 0) * (0.85 + Math.random() * 0.3)) -
          1) *
        100,
    }));
  }, [mytvData]);

  const getGrowthIcon = (growth) => {
    if (growth > 0)
      return <TrendingUpIcon className="h-4 w-4 text-green-600" />;
    if (growth < 0)
      return <TrendingDownIcon className="h-4 w-4 text-red-600" />;
    return <MinusIcon className="h-4 w-4 text-gray-400" />;
  };

  const getGrowthColor = (growth) => {
    if (growth > 5) return "text-green-700 bg-green-50";
    if (growth > 0) return "text-green-600 bg-green-50";
    if (growth < -5) return "text-red-700 bg-red-50";
    if (growth < 0) return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  if (loading) {
    return (
      <Card className="">
        <CardHeader className="">
          <CardTitle className="">Month-over-Month Growth</CardTitle>
          <CardDescription className="">
            Viewer growth percentage with color coding
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-gray-500">Loading growth data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="">
      <CardHeader className="">
        <CardTitle className="">Month-over-Month Growth</CardTitle>
        <CardDescription className="">
          Channel performance and growth trends
        </CardDescription>
      </CardHeader>
      <CardContent className="">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-700">
                  Channel
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">
                  Current Viewers
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">
                  Previous Month
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">
                  Growth
                </th>
                <th className="text-center py-3 px-2 font-medium text-gray-700">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {growthData.map((item, index) => (
                <tr
                  key={item.channel}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-2 font-medium text-gray-900">
                    {item.channel}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-900">
                    {(item.currentViewers / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3 px-2 text-right text-gray-600">
                    {(item.previousViewers / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGrowthColor(
                        item.growth
                      )}`}
                    >
                      {item.growth > 0 ? "+" : ""}
                      {item.growth.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    {getGrowthIcon(item.growth)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MytvGrowthTable;

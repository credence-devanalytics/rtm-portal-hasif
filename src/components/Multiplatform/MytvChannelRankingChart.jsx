import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const MytvChannelRankingChart = ({ mytvData, loading, selectedMonth }) => {
  const chartData = React.useMemo(() => {
    if (!mytvData?.channelBreakdown) {
      // Mock data for demonstration
      return [
        { channel: "TV2", viewers: 3755504, growth: 34.1 },
        { channel: "TV1", viewers: 3185251, growth: 29.6 },
        { channel: "OKEY", viewers: 3107018, growth: 10.7 },
        { channel: "SUKAN RTM", viewers: 2728607, growth: 15.2 },
        { channel: "TV6", viewers: 2162728, growth: 8.9 },
        { channel: "BERITA RTM", viewers: 1641945, growth: 12.3 },
        { channel: "BERNAMA", viewers: 1220216, growth: 5.7 },
      ].sort((a, b) => b.viewers - a.viewers);
    }

    return mytvData.channelBreakdown
      .map((item) => ({
        channel: item.channel,
        viewers: item.totalViewers || 0,
        avgViewers: item.avgViewers || 0,
        growth: Math.random() * 30 + 5, // Mock growth data
      }))
      .sort((a, b) => b.viewers - a.viewers)
      .slice(0, 10);
  }, [mytvData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Channel Ranking</CardTitle>
          <CardDescription>
            Performance for {selectedMonth || "selected month"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-gray-500">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Ranking</CardTitle>
        <CardDescription>Top performing channels by viewers</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            layout="horizontal"
            margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <YAxis type="category" dataKey="channel" width={50} fontSize={12} />
            <Tooltip
              formatter={(value, name) => [
                `${(value / 1000000).toFixed(2)}M viewers`,
                "Total Viewers",
              ]}
              labelFormatter={(label) => `Channel: ${label}`}
            />
            <Bar dataKey="viewers" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MytvChannelRankingChart;

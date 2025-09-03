import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const MytvChannelTrendsChart = ({ mytvData, loading }) => {
  const chartData = React.useMemo(() => {
    if (!mytvData?.monthlyTrends) {
      // Mock data for demonstration
      return [
        { month: "Jan", TV1: 2169000, TV2: 2727000, OKEY: 2800000 },
        { month: "Feb", TV1: 2812000, TV2: 3656000, OKEY: 3100000 },
        { month: "Mar", TV1: 3185251, TV2: 3755504, OKEY: 3107018 },
        { month: "Apr", TV1: 3183729, TV2: 3650000, OKEY: 3200000 },
        { month: "May", TV1: 3028576, TV2: 3580000, OKEY: 3150000 },
        { month: "Jun", TV1: 2995204, TV2: 3600000, OKEY: 3180000 },
      ];
    }

    // Group data by month and pivot by channel
    const monthMap = new Map();

    mytvData.monthlyTrends.forEach((item) => {
      const month = item.month;
      if (!monthMap.has(month)) {
        monthMap.set(month, { month });
      }
      // This would need to be enhanced based on actual data structure
      monthMap.get(month)[item.channel || "Total"] = item.totalViewers;
    });

    return Array.from(monthMap.values());
  }, [mytvData]);

  const channels = ["TV1", "TV2", "OKEY", "BERITA RTM", "SUKAN RTM", "TV6"];
  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MYTV Monthly Trends by Channel</CardTitle>
          <CardDescription>
            Track performance across all channels
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
        <CardTitle>MYTV Monthly Trends by Channel</CardTitle>
        <CardDescription>
          Track performance across all channels over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              formatter={(value, name) => [
                `${(value / 1000000).toFixed(2)}M viewers`,
                name,
              ]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            {channels.map((channel, index) => (
              <Line
                key={channel}
                type="monotone"
                dataKey={channel}
                stroke={colors[index]}
                strokeWidth={2}
                dot={{ fill: colors[index], strokeWidth: 2, r: 4 }}
                connectNulls={false}
                name={channel}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MytvChannelTrendsChart;

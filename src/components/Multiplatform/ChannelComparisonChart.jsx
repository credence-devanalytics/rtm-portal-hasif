import React from "react";
import {
  BarChart,
  Bar,
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

const ChannelComparisonChart = ({ mytvData, unifiData, loading }) => {
  // Debug logging to understand data structure
  React.useEffect(() => {
    console.log("ChannelComparisonChart - MyTV data:", mytvData);
    console.log("ChannelComparisonChart - Unifi data:", unifiData);
    if (mytvData?.channelBreakdown) {
      console.log(
        "MyTV channelBreakdown sample:",
        mytvData.channelBreakdown[0]
      );
    }
    if (unifiData?.channelBreakdown) {
      console.log(
        "Unifi channelBreakdown sample:",
        unifiData.channelBreakdown[0]
      );
    }
  }, [mytvData, unifiData]);

  const chartData = React.useMemo(() => {
    if (!mytvData?.channelBreakdown && !unifiData?.channelBreakdown) {
      console.log("No channel breakdown data available");
      return [];
    }

    // Combine channel data from both platforms
    const channelMap = new Map();

    // Add MYTV data
    if (mytvData?.channelBreakdown) {
      console.log(
        "Processing MyTV data:",
        mytvData.channelBreakdown.length,
        "channels"
      );
      mytvData.channelBreakdown.forEach((item) => {
        channelMap.set(item.channel, {
          channel: item.channel,
          mytvViewers: item.totalViewers || 0,
          unifiMau: 0,
        });
      });
    }

    // Add Unifi data
    if (unifiData?.channelBreakdown) {
      console.log(
        "Processing Unifi data:",
        unifiData.channelBreakdown.length,
        "channels"
      );
      unifiData.channelBreakdown.forEach((item) => {
        const existing = channelMap.get(item.channel) || {
          channel: item.channel,
          mytvViewers: 0,
        };
        channelMap.set(item.channel, {
          ...existing,
          unifiMau: item.totalMau || 0,
        });
      });
    }

    const result = Array.from(channelMap.values()).slice(0, 8); // Show top 8 channels
    console.log("Final chart data:", result);
    return result;
  }, [mytvData, unifiData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Channel Performance Comparison</CardTitle>
          <CardDescription>
            MYTV Viewers vs Unifi MAU by Channel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-gray-500">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Performance Comparison</CardTitle>
        <CardDescription>MYTV Viewers vs Unifi MAU by Channel</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="channel"
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value, name) => [
                name === "mytvViewers"
                  ? `${(value / 1000000).toFixed(1)}M`
                  : `${(value / 1000).toFixed(0)}K`,
                name === "mytvViewers" ? "MYTV Viewers" : "Unifi MAU",
              ]}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="mytvViewers"
              fill="#3b82f6"
              name="MYTV Viewers"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="unifiMau"
              fill="#10b981"
              name="Unifi MAU"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ChannelComparisonChart;

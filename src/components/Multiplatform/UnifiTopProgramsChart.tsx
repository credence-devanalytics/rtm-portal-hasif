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

const UnifiTopProgramsChart = ({ unifiData, loading }) => {
  const chartData = React.useMemo(() => {
    if (!unifiData?.topPrograms) {
      // Mock data for demonstration
      return [
        { name: "Malaysia Tonight", mau: 18700, duration: 30, channel: "TV1" },
        { name: "Berita Perdana", mau: 15000, duration: 30, channel: "TV1" },
        {
          name: "Siaran Langsung: Borak Dulu",
          mau: 12300,
          duration: 59,
          channel: "TV1",
        },
        {
          name: "Drama Bersiri Terbaru",
          mau: 11800,
          duration: 45,
          channel: "TV2",
        },
        {
          name: "Warna-Warni Pagi",
          mau: 10500,
          duration: 120,
          channel: "OKEY",
        },
        {
          name: "Sukan Perdana",
          mau: 9800,
          duration: 90,
          channel: "SUKAN RTM",
        },
        { name: "Dokumentari Alam", mau: 8900, duration: 60, channel: "TV6" },
        {
          name: "Berita Tengah Hari",
          mau: 8200,
          duration: 30,
          channel: "BERITA RTM",
        },
      ];
    }

    return unifiData.topPrograms.slice(0, 10);
  }, [unifiData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Programs by MAU</CardTitle>
          <CardDescription>
            Most popular content ranked by engagement
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
        <CardTitle>Top Programs by MAU</CardTitle>
        <CardDescription>
          Most engaging programs by monthly active users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            layout="horizontal"
            margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              fontSize={11}
              tick={{ textAnchor: "end" }}
            />
            <Tooltip
              formatter={(value, name) => [
                `${value.toLocaleString()} MAU`,
                "Monthly Active Users",
              ]}
              labelFormatter={(label) => `Program: ${label}`}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-medium text-gray-900 mb-1">{label}</p>
                      <p className="text-sm text-gray-600 mb-1">
                        MAU:{" "}
                        <span className="font-medium text-blue-600">
                          {data.mau.toLocaleString()}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Duration:{" "}
                        <span className="font-medium">{data.duration} min</span>
                      </p>
                      {data.channel && (
                        <p className="text-sm text-gray-600">
                          Channel:{" "}
                          <span className="font-medium">{data.channel}</span>
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="mau" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default UnifiTopProgramsChart;

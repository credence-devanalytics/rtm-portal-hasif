import React from "react";
import {
  ScatterChart,
  Scatter,
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

const DurationMauScatterChart = ({ unifiData, loading }) => {
  const chartData = React.useMemo(() => {
    if (!unifiData?.data) {
      // Mock data for demonstration
      return [
        {
          duration: 30,
          mau: 18700,
          avgAccess: 25,
          program: "Malaysia Tonight",
        },
        { duration: 30, mau: 15000, avgAccess: 28, program: "Berita Perdana" },
        { duration: 59, mau: 12300, avgAccess: 45, program: "Borak Dulu" },
        { duration: 45, mau: 11800, avgAccess: 38, program: "Drama Bersiri" },
        { duration: 120, mau: 10500, avgAccess: 85, program: "Warna-Warni" },
        { duration: 90, mau: 9800, avgAccess: 65, program: "Sukan Perdana" },
        { duration: 60, mau: 8900, avgAccess: 42, program: "Dokumentari" },
        {
          duration: 30,
          mau: 8200,
          avgAccess: 22,
          program: "Berita Tengah Hari",
        },
        { duration: 75, mau: 7800, avgAccess: 55, program: "Variety Show" },
        { duration: 105, mau: 7200, avgAccess: 78, program: "Movie Night" },
      ];
    }

    return unifiData.data
      .map((item) => ({
        duration: parseInt(item.duration) || 30,
        mau: parseInt(item.mau) || 0,
        avgAccess: Math.random() * 60 + 15, // Mock average access duration
        program: item.program_name?.substring(0, 20) + "..." || "Unknown",
      }))
      .slice(0, 20);
  }, [unifiData]);

  if (loading) {
    return (
      <Card className="">
        <CardHeader className="">
          <CardTitle className="">Duration vs MAU Analysis</CardTitle>
          <CardDescription className="">Program length impact on engagement</CardDescription>
        </CardHeader>
        <CardContent className="">
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-gray-500">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="">
      <CardHeader className="">
        <CardTitle className="">Duration vs MAU Analysis</CardTitle>
        <CardDescription className="">
          Relationship between program length and engagement (bubble size = avg
          access time)
        </CardDescription>
      </CardHeader>
      <CardContent className="">
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="duration"
              name="Duration"
              unit=" min"
              tickFormatter={(value) => `${value}m`}
            />
            <YAxis
              type="number"
              dataKey="mau"
              name="MAU"
              tickFormatter={(value) => `${(Number(value) / 1000).toFixed(0)}K`}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-medium text-gray-900 mb-1">
                        {data.program}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Duration:{" "}
                        <span className="font-medium text-blue-600">
                          {data.duration} min
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        MAU:{" "}
                        <span className="font-medium text-green-600">
                          {data.mau.toLocaleString()}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Avg Access:{" "}
                        <span className="font-medium text-purple-600">
                          {data.avgAccess.toFixed(1)} min
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter
              data={chartData}
              fill="#8b5cf6"
              stroke="#7c3aed"
              strokeWidth={1}
              fillOpacity={0.6}
            >
              {chartData.map((entry, index) => (
                <circle
                  key={index}
                  r={Math.max(3, Math.min(entry.avgAccess / 4, 12))}
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                  stroke="#7c3aed"
                  strokeWidth={1}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
            <span>Small bubble = Short access time</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-purple-400"></div>
            <span>Large bubble = Long access time</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DurationMauScatterChart;

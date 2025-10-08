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

interface Program {
  programName: string;
  mau: number;
  channelName: string;
}

interface UnifiCompareChannelsChartProps {
  topPrograms: Program[];
  loading?: boolean;
}

const UnifiCompareChannelsChart: React.FC<UnifiCompareChannelsChartProps> = ({
  topPrograms,
  loading = false,
}) => {
  // Filter programs by channel
  const tv1Programs = React.useMemo(() => {
    return topPrograms
      .filter((program) => program.channelName === "TV1")
      .slice(0, 10);
  }, [topPrograms]);

  const tv2Programs = React.useMemo(() => {
    return topPrograms
      .filter((program) => program.channelName === "TV2")
      .slice(0, 10);
  }, [topPrograms]);

  // Calculate max length for consistent truncation
  const maxProgramNameLength = React.useMemo(() => {
    const allPrograms = [...tv1Programs, ...tv2Programs];
    if (allPrograms.length === 0) return 25;
    return Math.max(...allPrograms.map((p) => p.programName.length), 25);
  }, [tv1Programs, tv2Programs]);

  const truncateProgramName = (name: string) => {
    if (name.length > maxProgramNameLength) {
      return name.substring(0, maxProgramNameLength) + "...";
    }
    return name;
  };

  if (loading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader className="">
          <CardTitle className="">Channel Comparison</CardTitle>
          <CardDescription className="">
            Compare top programs across channels
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          <div className="h-[400px] bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-gray-500">Loading comparison data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!topPrograms || topPrograms.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader className="">
          <CardTitle className="">Channel Comparison</CardTitle>
          <CardDescription className="">
            Compare top programs across channels
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          <div className="h-[400px] bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>No program data available for comparison</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm">
      <CardHeader className="">
        <CardTitle className="">TV1 & TV2 Channel Comparison</CardTitle>
        <CardDescription className="">
          Compare top programs performance across TV1 and TV2 channels
        </CardDescription>
      </CardHeader>
      <CardContent className="">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TV1 Programs Chart */}
          <div className="space-y-3">
            <h4
              className="text-lg font-semibold text-center pb-2"
              style={{ color: "#102D84", borderBottom: "2px solid #102D84" }}
            >
              TV1 Top Programs
            </h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={tv1Programs}
                margin={{
                  top: 5,
                  right: 15,
                  left: 20,
                  bottom: 5,
                }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => {
                    if (value === 0) return "0";
                    if (value >= 1000000)
                      return `${(Number(value) / 1000000).toFixed(1)}M`;
                    if (value >= 1000)
                      return `${Math.round(Number(value) / 1000)}K`;
                    return value.toString();
                  }}
                />
                <YAxis
                  dataKey="programName"
                  type="category"
                  width={150}
                  tick={{ fontSize: 11 }}
                  tickFormatter={truncateProgramName}
                />
                <Tooltip
                  formatter={(value) => [value.toLocaleString(), "MAU"]}
                  labelFormatter={(label) => `Program: ${label}`}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar
                  dataKey="mau"
                  fill="#102D84"
                  radius={[0, 4, 4, 0]}
                  stroke="#0A1F5C"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* TV2 Programs Chart */}
          <div className="space-y-3">
            <h4
              className="text-lg font-semibold text-center pb-2"
              style={{ color: "#FE5400", borderBottom: "2px solid #FE5400" }}
            >
              TV2 Top Programs
            </h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={tv2Programs}
                margin={{
                  top: 5,
                  right: 15,
                  left: 20,
                  bottom: 5,
                }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => {
                    if (value === 0) return "0";
                    if (value >= 1000000)
                      return `${(Number(value) / 1000000).toFixed(1)}M`;
                    if (value >= 1000)
                      return `${Math.round(Number(value) / 1000)}K`;
                    return value.toString();
                  }}
                />
                <YAxis
                  dataKey="programName"
                  type="category"
                  width={150}
                  tick={{ fontSize: 11 }}
                  tickFormatter={truncateProgramName}
                />
                <Tooltip
                  formatter={(value) => [value.toLocaleString(), "MAU"]}
                  labelFormatter={(label) => `Program: ${label}`}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar
                  dataKey="mau"
                  fill="#FE5400"
                  radius={[0, 4, 4, 0]}
                  stroke="#D94700"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiCompareChannelsChart;

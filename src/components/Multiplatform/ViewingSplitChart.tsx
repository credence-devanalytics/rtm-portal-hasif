import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const ViewingSplitChart = ({ unifiData, loading }) => {
  const chartData = React.useMemo(() => {
    if (!unifiData?.data) {
      // Mock data for demonstration
      return [
        { name: "Live TV", value: 65, color: "#3b82f6" },
        { name: "On-Demand", value: 35, color: "#10b981" },
      ];
    }

    // Calculate live vs on-demand split from actual data
    let liveTotal = 0;
    let onDemandTotal = 0;

    unifiData.data.forEach((item) => {
      if (item.duration_live && parseInt(item.duration_live) > 0) {
        liveTotal += parseInt(item.duration_live);
      }
      if (item.duration_on_demand && parseInt(item.duration_on_demand) > 0) {
        onDemandTotal += parseInt(item.duration_on_demand);
      }
    });

    const total = liveTotal + onDemandTotal;
    if (total === 0) {
      return [
        { name: "Live TV", value: 65, color: "#3b82f6" },
        { name: "On-Demand", value: 35, color: "#10b981" },
      ];
    }

    return [
      {
        name: "Live TV",
        value: Math.round((liveTotal / total) * 100),
        color: "#3b82f6",
        hours: Math.round(liveTotal / 3600),
      },
      {
        name: "On-Demand",
        value: Math.round((onDemandTotal / total) * 100),
        color: "#10b981",
        hours: Math.round(onDemandTotal / 3600),
      },
    ];
  }, [unifiData]);

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={14}
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unifi Viewing Split</CardTitle>
          <CardDescription>Live vs On-Demand distribution</CardDescription>
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
        <CardTitle>Unifi Viewing Split</CardTitle>
        <CardDescription>Live vs On-Demand distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              strokeWidth={2}
              stroke="#fff"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [
                `${value}%${
                  props.payload.hours ? ` (${props.payload.hours}h)` : ""
                }`,
                name,
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: entry.color, fontWeight: "500" }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ViewingSplitChart;

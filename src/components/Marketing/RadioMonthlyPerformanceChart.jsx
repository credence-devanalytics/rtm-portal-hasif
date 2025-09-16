"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const RadioMonthlyPerformanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-sm text-gray-500 font-sans">
        No radio monthly data available
      </div>
    );
  }

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg font-sans">
          <p className="font-semibold text-sm text-gray-800">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{ color: entry.color }}
              className="text-xs font-sans"
            >
              {`${entry.dataKey}: RM ${entry.value?.toLocaleString() || 0}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format tick labels for currency
  const formatYAxisTick = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fontFamily: "var(--font-geist-sans)" }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 11, fontFamily: "var(--font-geist-sans)" }}
            tickFormatter={formatYAxisTick}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "11px",
              fontFamily: "var(--font-geist-sans)",
            }}
          />
          <Line
            type="monotone"
            dataKey="2022"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="2022"
          />
          <Line
            type="monotone"
            dataKey="2023"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="2023"
          />
          <Line
            type="monotone"
            dataKey="2024"
            stroke="#ffc658"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="2024"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadioMonthlyPerformanceChart;

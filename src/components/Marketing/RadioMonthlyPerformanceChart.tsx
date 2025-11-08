"use client";

import { useMemo } from "react";
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

  // Determine which years have data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    data.forEach((item) => {
      if (item[2022] && item[2022] > 0) years.add(2022);
      if (item[2023] && item[2023] > 0) years.add(2023);
      if (item[2024] && item[2024] > 0) years.add(2024);
    });
    return Array.from(years).sort();
  }, [data]);

  const yearColors = {
    2022: "#8884d8",
    2023: "#82ca9d",
    2024: "#ffc658",
  };

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
      return `${(Number(value) / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(Number(value) / 1000).toFixed(0)}K`;
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
            height={60}
          />
          <YAxis
            tick={{ fontSize: 11, fontFamily: "var(--font-geist-sans)" }}
            tickFormatter={formatYAxisTick}
          />
          <Tooltip
            content={
              <CustomTooltip
                active={undefined}
                payload={undefined}
                label={undefined}
              />
            }
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "11px",
              fontFamily: "var(--font-geist-sans)",
            }}
          />
          {availableYears.map((year) => (
            <Line
              key={year}
              type="linear"
              dataKey={year.toString()}
              stroke={yearColors[year]}
              strokeWidth={3}
              dot={{ r: 5, fill: yearColors[year], strokeWidth: 0 }}
              name={year.toString()}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadioMonthlyPerformanceChart;

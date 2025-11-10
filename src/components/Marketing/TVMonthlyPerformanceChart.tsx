"use client";
import React, { useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TVMonthlyPerformanceChart = ({ data = [] }) => {
  // Determine which years have data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    if (data && Array.isArray(data)) {
      data.forEach((item) => {
        if (item[2022] && item[2022] > 0) years.add(2022);
        if (item[2023] && item[2023] > 0) years.add(2023);
        if (item[2024] && item[2024] > 0) years.add(2024);
      });
    }
    return Array.from(years).sort();
  }, [data]);

  const yearColors = {
    2022: "#94a3b8",
    2023: "#3b82f6",
    2024: "#10b981",
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg font-sans">
          <p className="font-semibold text-sm text-gray-800 mb-3">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-3 mb-1">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 text-xs font-sans">
                {entry.dataKey}:
              </span>
              <span className="font-semibold text-gray-800 text-xs font-sans">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="">
      <CardHeader className="">
        <CardTitle className="text-lg font-bold font-sans">
          TV Monthly Income Performance
        </CardTitle>
        <p className="text-sm text-gray-600 font-sans">
          Monthly revenue trends {availableYears.length > 1 ? `across ${availableYears.length} years` : `for ${availableYears[0]}`}
        </p>
      </CardHeader>
      <CardContent className="">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data || []}
            margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="monthName"
              tick={{ fontSize: 11, fontFamily: "var(--font-geist-sans)" }}
            />
            <YAxis
              tick={{ fontSize: 11, fontFamily: "var(--font-geist-sans)" }}
              tickFormatter={formatCurrency}
              domain={["dataMin", "dataMax"]}
              tickCount={8}
              padding={{ top: 20, bottom: 20 }}
            />
            <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
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
                dot={{ fill: yearColors[year], strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: yearColors[year], strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TVMonthlyPerformanceChart;

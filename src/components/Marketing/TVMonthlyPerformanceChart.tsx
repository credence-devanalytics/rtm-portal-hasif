"use client";
import React from "react";
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
          Monthly revenue trends across three years
        </p>
      </CardHeader>
      <CardContent className="">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
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
            <Line
              type="linear"
              dataKey="2022"
              stroke="#94a3b8"
              strokeWidth={3}
              dot={{ fill: "#94a3b8", strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: "#94a3b8", strokeWidth: 2 }}
            />
            <Line
              type="linear"
              dataKey="2023"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: "#3b82f6", strokeWidth: 2 }}
            />
            <Line
              type="linear"
              dataKey="2024"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: "#10b981", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TVMonthlyPerformanceChart;

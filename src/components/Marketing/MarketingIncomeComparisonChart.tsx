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

const MarketingIncomeComparisonChart = ({ data = [] }) => {
  // Debug: Log the incoming data
  console.log("Chart component received data:", data);

  // Transform the data for the line chart - restructure to have years as x-axis and channels as lines
  const chartData = [
    {
      year: "2022",
      ...data.reduce((acc, item) => {
        acc[item.saluran] = item.year2022Value || 0;
        return acc;
      }, {}),
    },
    {
      year: "2023",
      ...data.reduce((acc, item) => {
        acc[item.saluran] = item.previousValue;
        return acc;
      }, {}),
    },
    {
      year: "2024",
      ...data.reduce((acc, item) => {
        acc[item.saluran] = item.currentValue;
        return acc;
      }, {}),
    },
  ];

  // Debug: Log the transformed chart data
  console.log("Transformed chart data:", chartData);

  // Get unique channel names for creating lines
  const channels = data.map((item) => item.saluran);

  // Color palette for different channels
  const colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
    "#84cc16",
    "#ec4899",
    "#6366f1",
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate nice rounded ticks for Y-axis
  const calculateYAxisDomain = () => {
    const allValues = [];
    chartData.forEach((yearData) => {
      channels.forEach((channel) => {
        if (yearData[channel]) {
          allValues.push(yearData[channel]);
        }
      });
    });

    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);

    // Round up to nearest significant number
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    const roundedMax = Math.ceil(maxValue / magnitude) * magnitude;
    const roundedMin = Math.floor(minValue / magnitude) * magnitude;

    return [roundedMin, roundedMax];
  };

  const generateYAxisTicks = () => {
    const [min, max] = calculateYAxisDomain();
    const range = max - min;
    const tickCount = 6;
    const roughStep = range / (tickCount - 1);

    // Round step to a nice number (1, 2, 5 * 10^n)
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const residual = roughStep / magnitude;
    let niceStep;

    if (residual <= 1) niceStep = magnitude;
    else if (residual <= 2) niceStep = 2 * magnitude;
    else if (residual <= 5) niceStep = 5 * magnitude;
    else niceStep = 10 * magnitude;

    const ticks = [];
    for (let i = 0; i <= tickCount; i++) {
      const tick = min + niceStep * i;
      if (tick <= max) {
        ticks.push(tick);
      }
    }

    return ticks;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-3 text-base">
            Year: {label}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-3 mb-1">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 text-sm">{entry.dataKey}:</span>
              <span className="font-semibold text-gray-800 text-sm">
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
          Income Comparison: 2022 vs 2023 vs 2024
        </CardTitle>
        <p className="text-sm text-gray-600 font-sans">
          Three-year comparison of income by marketing channel
        </p>
      </CardHeader>
      <CardContent className="">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 14 }} />
            <YAxis
              tick={{ fontSize: 14 }}
              tickFormatter={formatCurrency}
              domain={calculateYAxisDomain()}
              ticks={generateYAxisTicks()}
              padding={{ top: 20, bottom: 20 }}
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
            <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "14px" }} />
            {channels.map((channel, index) => (
              <Line
                key={channel}
                type="linear"
                dataKey={channel}
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={{
                  fill: colors[index % colors.length],
                  strokeWidth: 2,
                  r: 6,
                }}
                activeDot={{
                  r: 8,
                  stroke: colors[index % colors.length],
                  strokeWidth: 2,
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MarketingIncomeComparisonChart;

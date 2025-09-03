"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const HourlyViewershipChart = ({ filters = {} }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHourlyData();
  }, [filters]);

  const fetchHourlyData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        limit: 500, // Get more data to aggregate by hour
        ...filters,
      });

      const response = await fetch(`/api/multiplatform?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();

      // Aggregate data by hour
      const hourlyData = {};

      result.data.forEach((item) => {
        if (item.start_time) {
          const hour = parseInt(item.start_time.split(":")[0]);
          if (hour >= 0 && hour <= 23) {
            if (!hourlyData[hour]) {
              hourlyData[hour] = {
                hour: `${hour.toString().padStart(2, "0")}:00`,
                totalMau: 0,
                programCount: 0,
              };
            }
            hourlyData[hour].totalMau += parseInt(item.mau) || 0;
            hourlyData[hour].programCount += 1;
          }
        }
      });

      // Convert to array and sort by hour
      const chartData = Object.values(hourlyData).sort(
        (a, b) =>
          parseInt(a.hour.split(":")[0]) - parseInt(b.hour.split(":")[0])
      );

      setData(chartData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">Time: {label}</p>
          <p className="text-blue-600">
            Total MAU: {data.totalMau.toLocaleString()}
          </p>
          <p className="text-green-600">Programs: {data.programCount}</p>
          <p className="text-purple-600">
            Avg MAU/Program:{" "}
            {Math.round(data.totalMau / data.programCount).toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hourly Viewership Distribution
        </h3>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hourly Viewership Distribution
        </h3>
        <div className="h-80 flex items-center justify-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Hourly Viewership Distribution
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="hour" fontSize={12} />
            <YAxis
              tickFormatter={(value) => value.toLocaleString()}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalMau" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HourlyViewershipChart;

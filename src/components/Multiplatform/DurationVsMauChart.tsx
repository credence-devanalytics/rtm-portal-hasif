"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DurationVsMauChart = ({ filters = {} }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchScatterData = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        limit: "100", // Get more data for scatter plot
        ...filters,
      });

      const response = await fetch(`/api/multiplatform?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();

      // Transform data for scatter plot
      const scatterData = result.data
        .filter((item) => item.duration && item.mau) // Only include items with both values
        .map((item) => ({
          duration: parseFloat(item.duration) || 0,
          mau: parseInt(item.mau) || 0,
          programName: item.program_name,
          channelName: item.channel_name,
          date: item.programme_date,
        }));

      setData(scatterData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchScatterData();
  }, [fetchScatterData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.programName}</p>
          <p className="text-sm text-gray-600">Channel: {data.channelName}</p>
          <p className="text-blue-600">Duration: {data.duration} min</p>
          <p className="text-green-600">MAU: {data.mau.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Date: {data.date}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Program Duration vs MAU
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
          Program Duration vs MAU
        </h3>
        <div className="h-80 flex items-center justify-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Program Duration vs MAU
        </h3>
        <p className="text-sm text-gray-500">{data.length} programs</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              type="number"
              dataKey="duration"
              name="Duration (min)"
              tickFormatter={(value) => `${value}m`}
              fontSize={12}
            />
            <YAxis
              type="number"
              dataKey="mau"
              name="MAU"
              tickFormatter={(value) => value.toLocaleString()}
              fontSize={12}
            />
            <Tooltip
              content={<CustomTooltip active={undefined} payload={undefined} />}
            />
            <Scatter
              name="Programs"
              data={data}
              fill="#8B5CF6"
              fillOpacity={0.7}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DurationVsMauChart;

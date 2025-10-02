"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const ProgramTrendChart = ({ filters = {} }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrograms, setSelectedPrograms] = useState([]);

  useEffect(() => {
    fetchTrendData();
  }, [filters]);

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        limit: 1000, // Get more data for trend analysis
        ...filters,
      });

      const response = await fetch(`/api/multiplatform?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();

      // Group data by program and month
      const programData = {};

      result.data.forEach((item) => {
        const programKey = `${item.program_name} (${item.channel_name})`;
        const monthYear = item.viewership_month_year;

        if (!programData[programKey]) {
          programData[programKey] = {};
        }

        if (!programData[programKey][monthYear]) {
          programData[programKey][monthYear] = {
            monthYear,
            totalMau: 0,
            count: 0,
          };
        }

        programData[programKey][monthYear].totalMau += parseInt(item.mau) || 0;
        programData[programKey][monthYear].count += 1;
      });

      // Get top 5 programs by total MAU for trend display
      const programTotals = Object.keys(programData)
        .map((program) => ({
          program,
          totalMau: Object.values(programData[program]).reduce(
            (sum, month) => sum + month.totalMau,
            0
          ),
        }))
        .sort((a, b) => b.totalMau - a.totalMau)
        .slice(0, 5);

      setSelectedPrograms(programTotals.map((p) => p.program));

      // Create time series data
      const allMonths = [
        ...new Set(
          Object.values(programData).flatMap((program) => Object.keys(program))
        ),
      ].sort();

      const trendData = allMonths.map((month) => {
        const monthData = { monthYear: month };
        programTotals.forEach(({ program }) => {
          monthData[program] = programData[program][month]?.totalMau || 0;
        });
        return monthData;
      });

      setData(trendData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value.toLocaleString()} MAU
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Program Trend Over Time
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
          Program Trend Over Time
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
        Program Trend Over Time (Top 5 Programs)
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="monthYear"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tickFormatter={(value) => value.toLocaleString()}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {selectedPrograms.map((program, index) => (
              <Line
                key={program}
                type="monotone"
                dataKey={program}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgramTrendChart;

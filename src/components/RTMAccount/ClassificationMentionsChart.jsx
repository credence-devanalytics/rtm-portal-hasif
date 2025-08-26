import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Tag, Search } from "lucide-react";

const ClassificationMentionsChart = ({ data = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("count"); // 'count' or 'alphabetical'
  const [showTop, setShowTop] = useState(20); // Show top N classifications

  // Process the data to count mentions per category
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    try {
      // Count mentions by category
      const categoryCounts = data.reduce((acc, item) => {
        if (item && item.category) {
          const category = item.category.trim();
          acc[category] = (acc[category] || 0) + 1;
        }
        return acc;
      }, {});

      // Convert to array format for recharts
      let chartData = Object.entries(categoryCounts).map(
        ([category, count]) => ({
          category,
          count,
          displayName:
            category.length > 15 ? category.substring(0, 12) + "..." : category,
        })
      );

      // Filter by search term
      if (searchTerm) {
        chartData = chartData.filter((item) =>
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sort data
      if (sortBy === "count") {
        chartData.sort((a, b) => b.count - a.count);
      } else {
        chartData.sort((a, b) => a.category.localeCompare(b.category));
      }

      // Limit to top N
      return chartData.slice(0, showTop);
    } catch (error) {
      console.error("Error processing data:", error);
      return [];
    }
  }, [data, searchTerm, sortBy, showTop]);

  const totalMentions = useMemo(() => {
    return processedData.reduce((sum, item) => sum + item.count, 0);
  }, [processedData]);

  const uniqueClassifications = processedData.length;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white  max-w-xs">
          <p className="font-semibold text-gray-800 mb-2 break-words">
            {data.category}
          </p>
          <div className="flex items-center justify-between font-semibold">
            <span>Total Mentions</span>
            <span className="text-blue-600">{data.count}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (!data) {
    return (
      <div className="bg-white  p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="bg-white p-8 text-center">
        <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Data Available
        </h3>
        <p className="text-gray-500">
          No classification data found to display.
        </p>
      </div>
    );
  }

  // No results after filtering
  if (processedData.length === 0) {
    return (
      <div className="bg-white">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Tag className="h-5 w-5 mr-2 text-blue-600" />
              Classification Mentions
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search classifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="p-8 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Results Found
          </h3>
          <p className="text-gray-500">
            No classifications match your search criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white ">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Classification Posts
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {totalMentions.toLocaleString()} total posts across{" "}
              {uniqueClassifications} classifications
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search classifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="count">Sort by Count</option>
              <option value="alphabetical">Sort Alphabetically</option>
            </select>

            {/* Show Top N */}
            {/* <select
              value={showTop}
              onChange={(e) => setShowTop(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
              <option value={100}>All Classifications</option>
            </select> */}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="h-80 sm:h-[350px] lg:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
              barCategoryGap="10%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="displayName"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                fontSize={12}
                stroke="#666"
                label={{
                  value: "Classification",
                  position: "insideBottom",
                  offset: -5,
                  style: {
                    textAnchor: "middle",
                    fontSize: "14px",
                    fontWeight: "bold",
                    fill: "#374151",
                  },
                }}
              />
              <YAxis
                fontSize={12}
                stroke="#666"
                tickFormatter={(value) => value.toLocaleString()}
                label={{
                  value: "Posts",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                    fontSize: "14px",
                    fontWeight: "bold",
                    fill: "#374151",
                  },
                }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
              />
              <Bar
                dataKey="count"
                fill="#3b82f6"
                name="Mentions"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      {/* <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {totalMentions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Mentions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">
              {uniqueClassifications}
            </div>
            <div className="text-sm text-gray-600">Classifications</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {processedData.length > 0
                ? (totalMentions / uniqueClassifications).toFixed(1)
                : 0}
            </div>
            <div className="text-sm text-gray-600">Avg per Classification</div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default ClassificationMentionsChart;

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Users, Filter, Search } from "lucide-react";

const PlatformMentionsChart = ({ data = [], onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("count"); // 'count' or 'alphabetical'
  const [showTop, setShowTop] = useState(10); // Show top N platforms (reduced default)

  // Process the data to count mentions per author (platform)
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    try {
      // Count mentions by author
      const authorCounts = data.reduce((acc, item) => {
        if (item && item.author) {
          const author = item.author.trim();
          acc[author] = (acc[author] || 0) + 1;
        }
        return acc;
      }, {});

      // Convert to array format for recharts
      let chartData = Object.entries(authorCounts).map(([author, count]) => ({
        author,
        count,
        displayName:
          author.length > 12 ? author.substring(0, 10) + "..." : author,
      }));

      // Filter by search term
      if (searchTerm) {
        chartData = chartData.filter((item) =>
          item.author.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sort data
      if (sortBy === "count") {
        chartData.sort((a, b) => Number(b.count) - Number(a.count));
      } else {
        chartData.sort((a, b) => a.author.localeCompare(b.author));
      }

      // Limit to top N
      return chartData.slice(0, showTop);
    } catch (error) {
      console.error("Error processing data:", error);
      return [];
    }
  }, [data, searchTerm, sortBy, showTop]);

  const totalMentions = useMemo(() => {
    return processedData.reduce(
      (sum, item) => sum + Number((item as any).count),
      0
    );
  }, [processedData]);

  const uniquePlatforms = processedData.length;

  // Handle bar click for cross-filtering
  const handleBarClick = (data, index) => {
    if (onFilterChange && data && data.author) {
      onFilterChange("author", data.author);
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const fullAuthor =
        processedData.find((item) => item.displayName === label)?.author ||
        label;
      return (
        <div className="bg-white max-w-xs border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-800 text-xs mb-1 break-words">
            {fullAuthor}
          </p>
          <p className="text-blue-600 text-xs font-medium">
            Mentions:{" "}
            <span className="font-bold">
              {data.value?.toLocaleString() || "N/A"}
            </span>
          </p>
          {totalMentions > 0 && (
            <p className="text-gray-500 text-xs">
              {((data.value / totalMentions) * 100).toFixed(1)}% of total
            </p>
          )}
          {onFilterChange && (
            <p className="text-xs text-gray-400 mt-1 italic">
              Click to filter by this author
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (!data) {
    return (
      <div className="h-full">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="bg-white h-full flex flex-col items-center justify-center p-4 text-center">
        <TrendingUp className="h-8 w-8 text-gray-400 mb-2" />
        <h3 className="text-sm font-medium text-gray-900 mb-1">
          No Data Available
        </h3>
        <p className="text-xs text-gray-500">No social media mentions found.</p>
      </div>
    );
  }

  // No results after filtering
  if (processedData.length === 0) {
    return (
      <div className="bg-white h-full flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center mb-2">
            <Users className="h-4 w-4 mr-1 text-blue-600" />
            Channel Posts
          </h2>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 pr-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <div>
            <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              No Results
            </h3>
            <p className="text-xs text-gray-500">
              No platforms match your search.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-[600px] flex flex-col">
      {/* Compact Header */}
      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] font-bold text-gray-900 flex items-center">
              Channel Posts
            </h2>
            <span className="text-xs text-gray-500">
              {totalMentions.toLocaleString()}
            </span>
          </div>

          {/* Controls Row 1 */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
            <select
              value={showTop}
              onChange={(e) => setShowTop(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
            </select>
          </div>

          {/* Controls Row 2 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent w-full"
          >
            <option value="count">Sort by Count</option>
            <option value="alphabetical">Sort Alphabetically</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-3 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processedData}
            layout="vertical"
            margin={{
              left: 5,
              right: 20,
              top: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              type="number"
              dataKey="count"
              fontSize={10}
              stroke="#666"
              tickFormatter={(value) =>
                value >= 1000
                  ? `${(Number(value) / 1000).toFixed(0)}k`
                  : value.toString()
              }
              domain={[0, "dataMax"]}
              allowDecimals={false}
            />
            <YAxis
              dataKey="displayName"
              type="category"
              tickLine={false}
              tickMargin={5}
              axisLine={false}
              fontSize={9}
              stroke="#666"
              width={60}
              interval={0}
              className={onFilterChange ? "cursor-pointer" : ""}
              tick={{ cursor: onFilterChange ? "pointer" : "default" }}
            />
            <Tooltip
              cursor={false}
              content={
                <CustomTooltip
                  active={undefined}
                  payload={undefined}
                  label={undefined}
                />
              }
            />
            <Bar
              dataKey="count"
              fill="#4E5899"
              radius={2}
              cursor={onFilterChange ? "pointer" : "default"}
              onClick={handleBarClick}
              className={
                onFilterChange
                  ? "hover:opacity-80 transition-opacity duration-200"
                  : ""
              }
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Clickable hint */}
      {onFilterChange && (
        <div className="px-3 pb-2 flex-shrink-0">
          <p className="text-xs text-gray-400 italic text-center">
            💡 Click on bars to filter by author
          </p>
        </div>
      )}
    </div>
  );
};

export default PlatformMentionsChart;

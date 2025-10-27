import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const PlatformDonutChart = ({
  data,
  platformsData,
  platformByUnitData, // New prop for unit-specific platform distribution
  hasActiveFilters,
  onFilterChange,
  activeFilters = {},
  channelsData, // Add channelsData prop for unit-specific filtering
}: any) => {
  // Normalize platform names to match color keys
  const normalizePlatformName = (platform: string): string => {
    const normalized = platform.toLowerCase();
    const platformMap = {
      facebook: "Facebook",
      instagram: "Instagram",
      twitter: "Twitter",
      tiktok: "TikTok",
      youtube: "YouTube",
      linkedin: "LinkedIn",
      reddit: "Reddit",
      web: "Other",
      other: "Other",
    };
    return platformMap[normalized] || "Unknown";
  };

  // ALWAYS count accurately based on available data source
  // Priority: 1) Database aggregations (when available), 2) Client-side counting (when filtered)
  const platformCounts = useMemo(() => {
    // Check if we have data-limiting filters (not including unit filter)
    const hasDataLimitingFilters =
      activeFilters?.sentiment ||
      activeFilters?.platform ||
      activeFilters?.category ||
      activeFilters?.author;

    // If we have data-limiting filters, must count from client-side filtered data
    if (hasDataLimitingFilters) {
      console.log(
        "⚠️ PlatformDonutChart: Using client-side counts (data-limiting filters active)"
      );
      console.log("   - Data length:", data.length);
      console.log("   - Active filters:", activeFilters);

      return data.reduce((acc, item) => {
        const platform = normalizePlatformName(item.platform || "unknown");
        acc[platform] = (acc[platform] || 0) + 1;
        return acc;
      }, {});
    }

    // Check if we have a unit filter (tab selection)
    const unitFilter = activeFilters?.unit;

    // If unit filter is active and we have platformByUnit data from API, use that for accuracy!
    if (
      unitFilter &&
      unitFilter !== "overall" &&
      platformByUnitData &&
      platformByUnitData.length > 0
    ) {
      console.log(
        "✅ PlatformDonutChart: Using database platformByUnit aggregation for unit:",
        unitFilter
      );

      // Map unit filter value to database unit name
      const unitMap = {
        tv: "TV",
        radio: "Radio",
        berita: "News",
        news: "News",
        official: "Official",
      };

      const targetUnit = unitMap[unitFilter.toLowerCase()] || unitFilter;
      console.log("   - Target unit:", targetUnit);

      // Filter platformByUnit data for the current unit
      const unitPlatforms = platformByUnitData.filter(
        (p) => p.unit === targetUnit
      );

      console.log("   - Unit platforms found:", unitPlatforms.length);
      console.log("   - Unit platforms data:", unitPlatforms);

      // Convert to counts object
      return unitPlatforms.reduce((acc, item) => {
        const platform = normalizePlatformName(item.platform);
        acc[platform] = Number(item.count);
        return acc;
      }, {});
    }

    // No filters at all - use database platform aggregations for maximum accuracy
    if (platformsData && platformsData.length > 0) {
      console.log(
        "✅ PlatformDonutChart: Using database platform aggregations (no filters)"
      );
      console.log("   - Platforms data:", platformsData);

      return platformsData.reduce((acc, item) => {
        const platform = normalizePlatformName(item.platform);
        acc[platform] = Number(item.count);
        return acc;
      }, {});
    }

    // Fallback: count from whatever data we have
    console.log("⚠️ PlatformDonutChart: Fallback to client-side counting");
    return data.reduce((acc, item) => {
      const platform = normalizePlatformName(item.platform || "unknown");
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {});
  }, [data, platformsData, platformByUnitData, channelsData, activeFilters]);

  console.log("Platform Counts:", platformCounts);

  // Calculate total from actual platform counts, not data.length
  const totalMentions = useMemo(() => {
    const total = Object.values(platformCounts).reduce(
      (sum: number, count) => sum + Number(count),
      0
    ) as number;
    return total;
  }, [platformCounts]) as number;

  console.log("Total Mentions for percentage calculation:", totalMentions);

  // Convert to chart data format
  // Sort the chartData after creating it
  const chartData = Object.entries(platformCounts)
    .map(([platform, count]) => ({
      name: platform,
      value: count,
      percentage:
        totalMentions > 0
          ? (((count as number) / totalMentions) * 100).toFixed(1)
          : "0.0",
    }))
    .sort((a, b) => Number(b.value) - Number(a.value)); // Sort by value descending

  // Platform colors - using actual color values
  const platformColors = {
    Facebook: "#1877F2", // Facebook blue
    Instagram: "#E4405F", // Instagram gradient pink
    Twitter: "#1DA1F2", // Twitter blue
    TikTok: "#000000", // TikTok black
    YouTube: "#FF0000", // YouTube red
    LinkedIn: "#0A66C2", // LinkedIn blue
    Reddit: "#FF4500", // Reddit orange
    Other: "#94A3B8", // Slate gray
    Unknown: "#64748B", // Darker slate
  };

  // Get color for platform or use a default
  const getColor = (platform, index) => {
    const color = platformColors[platform];
    if (color) {
      console.log(`🎨 Platform "${platform}" -> Color: ${color}`);
      return color;
    }
    console.warn(
      `⚠️ No color defined for platform: "${platform}", using fallback`
    );
    return `hsl(${index * 45}, 70%, 50%)`;
  };

  // Handle pie slice click for cross-filtering
  const handlePieSliceClick = (data, index) => {
    if (onFilterChange && data && data.name) {
      console.log("🖱️ Platform clicked:", data.name);
      onFilterChange("platform", data.name);
    }
  };

  // Handle legend click for cross-filtering
  const handleLegendClick = (value, entry) => {
    if (onFilterChange && entry && entry.payload) {
      console.log("🖱️ Legend clicked:", entry.payload.name);
      onFilterChange("platform", entry.payload.name);
    }
  };

  // Check if a platform is currently filtered
  const isPlatformFiltered = (platform) => {
    return activeFilters?.platform === platform;
  };

  // Get visual styling based on filter state
  const getFilteredOpacity = (platform) => {
    if (!activeFilters?.platform) return 1; // No filter active
    if (isPlatformFiltered(platform)) {
      return 1; // Highlighted
    } else {
      return 0.3; // Dimmed
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-gray-600">
            <span className="font-medium">{data.value}</span> mentions (
            {data.percentage}%)
          </p>
          {onFilterChange && (
            <p className="text-xs text-gray-400 mt-1 italic">
              Click to filter by this platform
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom label function
  const renderLabel = ({ name, percentage }) => {
    return `${percentage}%`;
  };

  // Custom legend formatter with click handling
  const CustomLegend = (props) => {
    const { payload } = props;

    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {payload.map((entry, index) => {
          const isFiltered = isPlatformFiltered(entry.value);
          const hasActiveFilter = activeFilters?.platform;

          return (
            <div
              key={`legend-${index}`}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md transition-all duration-200 ${
                onFilterChange ? "cursor-pointer hover:bg-gray-100" : ""
              } ${
                isFiltered
                  ? "bg-blue-100 ring-2 ring-blue-500"
                  : hasActiveFilter
                  ? "opacity-50"
                  : ""
              }`}
              onClick={() => handleLegendClick(entry.value, entry)}
            >
              <div
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  isFiltered ? "ring-2 ring-blue-400" : ""
                }`}
                style={{ backgroundColor: entry.color }}
              />
              <span
                className={`text-sm ${
                  isFiltered
                    ? "text-blue-900 font-bold"
                    : "text-gray-700 font-bold"
                }`}
              >
                {entry.value} ({entry.payload.value})
                {isFiltered && <span className="ml-1 text-blue-600">●</span>}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Sources Distribution - Posts
        </h2>
        <p className="text-gray-600">
          Share of conversations by platform to gauge where your topic is being
          discussed most
        </p>
      </div>

      <div className="w-full">
        <ResponsiveContainer width="100%" height={450}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={140}
              innerRadius={0}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
              cursor={onFilterChange ? "pointer" : "default"}
              onClick={handlePieSliceClick}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColor(entry.name, index)}
                  fillOpacity={getFilteredOpacity(entry.name)}
                  className={
                    onFilterChange
                      ? "hover:opacity-80 transition-all duration-200"
                      : ""
                  }
                />
              ))}
            </Pie>
            <Legend content={<CustomLegend />} />
            <Tooltip
              content={<CustomTooltip active={undefined} payload={undefined} />}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Clickable hint */}
      {onFilterChange && (
        <div className="mt-4">
          <p className="text-xs text-gray-400 italic text-center">
            💡 Click on pie slices or legend items to filter by platform
            {activeFilters?.platform && (
              <span className="text-blue-600 font-medium ml-2">
                (Currently filtering by: {activeFilters.platform})
              </span>
            )}
          </p>
        </div>
      )}

      {/* Summary stats */}
      {/* <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {chartData.map((item, index) => (
          <div
            key={item.name}
            className="text-center p-3 bg-gray-50 rounded-lg"
          >
            <div
              className="w-4 h-4 rounded-full mx-auto mb-2"
              style={{ backgroundColor: getColor(item.name, index) }}
            ></div>
            <p className="text-sm font-semibold text-gray-800">{item.name}</p>
            <p className="text-lg font-bold text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-500">{item.percentage}%</p>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default PlatformDonutChart;

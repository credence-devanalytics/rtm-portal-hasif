"use client";
import * as React from "react";
import { useCallback } from "react";
import {
  Label,
  Pie,
  PieChart,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, Loader2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Removed ChartTooltip imports - using native Recharts Tooltip instead

const RTMUnitsPieChart = ({
  data = [],
  unitsData = null, // Database aggregation from API: { data: [], total: number }
  channelsData = null, // Channel breakdown from API: { data: [], total: number }
  hasActiveFilters = false, // Whether data-limiting filters are active
  title = "RTM Units Posts Distribution",
  description = "Distribution of posts across RTM units",
  onFilterChange = null, // Prop for cross-filtering
  activeFilters = {}, // New prop to receive active filters from parent
  setActiveTab = null, // Prop to update the active tab (same behavior as clicking tabs)
  activeTab = "overall", // Current active tab to check for toggle behavior
}: any) => {
  // Debug: Log when component renders and what activeFilters it receives
  console.log("🔄 RTMUnitsPieChart RENDER - activeFilters:", activeFilters);
  console.log(
    "🔄 RTMUnitsPieChart RENDER - onFilterChange exists:",
    !!onFilterChange
  );

  // Function to transform unit names
  const transformUnitName = (unit) => {
    if (unit === "News") {
      return "Berita";
    }
    return unit;
  };

  // Convert unit name to filter value that parent expects
  const unitToFilterValue = (unit) => {
    if (!unit) return null;
    const unitLower = unit.toLowerCase();

    // Map display names to filter values expected by parent
    // Use partial matching to handle database values like "BERITA RTM", "Radio stations", "TV channels"
    if (unitLower.includes("berita") || unitLower.includes("news"))
      return "berita";
    if (unitLower.includes("tv")) return "tv";
    if (unitLower.includes("radio")) return "radio";
    if (unitLower.includes("official")) return "official";

    // Default: return lowercase version
    return unitLower;
  };

  // Handle click on pie slices (same behavior as clicking tabs)
  const handlePieClick = (data, index, event) => {
    console.log("🎯 Pie clicked! Data:", data, "Payload:", data?.payload);
    if (data && data.payload) {
      // In Recharts, the actual data is in the payload property
      const unitValue = data.payload.unit;
      const filterValue = unitToFilterValue(unitValue);

      console.log(
        "Pie click - Unit value:",
        unitValue,
        "-> Filter:",
        filterValue,
        "Current activeTab:",
        activeTab
      );

      // Toggle behavior: if clicking the same unit, reset to "overall"
      const isAlreadyActive = activeTab === filterValue;
      const newTabValue = isAlreadyActive ? "overall" : filterValue;
      const newFilterValue = isAlreadyActive ? null : filterValue;

      console.log(
        isAlreadyActive
          ? "Toggle off - resetting to overall"
          : "Activating filter:",
        newTabValue
      );

      // Update active tab (same as clicking tab button)
      if (setActiveTab) {
        console.log("Setting active tab to:", newTabValue);
        setActiveTab(newTabValue);
      }

      // Update global filter (same as tab's onFilterChange)
      if (onFilterChange) {
        console.log("Calling onFilterChange with:", "unit", newFilterValue);
        onFilterChange("unit", newFilterValue);
      }
    } else {
      console.warn("⚠️ Cannot filter - missing data");
    }
  };

  // Handle click on summary stat cards (toggle behavior - clicking same unit resets to overall)
  const handleStatCardClick = (unit) => {
    const filterValue = unitToFilterValue(unit);
    console.log(
      "Stat card click - Unit value:",
      unit,
      "-> Filter:",
      filterValue,
      "Current activeTab:",
      activeTab
    ); // Debug log

    // Toggle behavior: if clicking the same unit, reset to "overall"
    const isAlreadyActive = activeTab === filterValue;
    const newTabValue = isAlreadyActive ? "overall" : filterValue;
    const newFilterValue = isAlreadyActive ? null : filterValue;

    console.log(
      isAlreadyActive
        ? "Toggle off - resetting to overall"
        : "Activating filter:",
      newTabValue
    );

    // Update active tab (same as clicking tab button)
    if (setActiveTab) {
      console.log("Setting active tab to:", newTabValue);
      setActiveTab(newTabValue);
    }

    // Update global filter (same as tab's onFilterChange)
    if (onFilterChange) {
      onFilterChange("unit", newFilterValue);
    }
  };

  // Function to generate shades of a color for channels within a unit
  const generateShades = (baseColor, count) => {
    const shades = [];
    for (let i = 0; i < count; i++) {
      // Create different opacity levels for the same base color
      const opacity = 0.4 + (0.6 * (i + 1)) / count; // Range from 0.4 to 1.0
      // Convert hex to rgba for opacity
      const hex = baseColor.replace("#", "");
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      shades.push(`rgba(${r}, ${g}, ${b}, ${opacity})`);
    }
    return shades;
  };

  // Check if a unit is currently filtered
  const isUnitFiltered = useCallback(
    (unit) => {
      if (!unit) return false;
      const unitLower = unit.toLowerCase();

      // Map display names to filter values expected by parent
      let filterValue = unitLower;
      if (unitLower === "berita" || unitLower === "news")
        filterValue = "berita";
      else if (unitLower === "tv") filterValue = "tv";
      else if (unitLower === "radio") filterValue = "radio";
      else if (unitLower === "official") filterValue = "official";

      const isFiltered = activeFilters?.unit === filterValue;
      console.log(`🔍 isUnitFiltered("${unit}"):`, {
        unitLower,
        filterValue,
        activeFilterUnit: activeFilters?.unit,
        isFiltered,
      });
      return isFiltered;
    },
    [activeFilters?.unit]
  );

  // Get visual styling based on filter state
  const getFilteredStyle = (unit) => {
    if (!activeFilters?.unit) return {}; // No filter active
    if (isUnitFiltered(unit)) {
      return {
        opacity: 1,
        filter: "brightness(1.1) saturate(1.2)",
        transform: "scale(1.02)",
      };
    } else {
      return {
        opacity: 0.4,
        filter: "brightness(0.8) saturate(0.5)",
      };
    }
  };

  // Process data to create sunburst structure
  const { innerData, outerData, chartConfig, totalMentions } =
    React.useMemo(() => {
      /**
       * ✅ API-FIRST FILTERING STRATEGY
       *
       * Following the cross-filtering template:
       * - ALWAYS use API data (unitsData & channelsData)
       * - The API already respects all filters (platform, author, etc.)
       * - DO NOT switch to client-side data based on hasActiveFilters
       * - Client-side data is usually empty (we don't load all mentions)
       *
       * The backend handles filtering via SQL queries with WHERE clauses
       * based on filter parameters passed to the API hooks.
       */

      // ✅ ALWAYS use API data - it's already filtered by the backend
      const useApiData =
        unitsData && unitsData.data && unitsData.data.length > 0;

      console.log("🔍 RTMUnitsPieChart - Data source decision:", {
        useApiData,
        hasActiveFilters,
        hasUnitsData: !!unitsData,
        unitsDataLength: unitsData?.data?.length,
        hasChannelsData: !!channelsData,
        channelsDataLength: channelsData?.data?.length,
        clientDataLength: data?.length,
        activeFilters,
      });
      /**
       * Predefined color mapping for each unit - ensures consistent colors across filters
       *
       * Original Color Scheme:
       * 🟢 TV        → Green (#28a745)
       * 🔵 Berita    → Blue-purple (#4E5899)
       * 🟠 Radio     → Orange (#ff9705)
       * 🔴 Official  → Red (#dc3545)
       * 🟧 Other     → Orange variant (#fd7e14)
       * 🔷 Default   → Teal (#20c997)
       */
      const unitColorMap = {
        // TV variations
        TV: "#28a745",
        tv: "#28a745",

        // Berita/News variations
        Berita: "#4E5899",
        berita: "#4E5899",
        News: "#4E5899",
        news: "#4E5899",

        // Radio variations
        Radio: "#ff9705",
        radio: "#ff9705",

        // Official variations
        Official: "#dc3545",
        official: "#dc3545",

        // Other variations
        Other: "#fd7e14",
        other: "#fd7e14",

        // Default
        Default: "#20c997",
        default: "#20c997",
      };

      // Fallback colors for any unexpected units
      const fallbackColors = [
        "#dc3545", // Red
        "#e83e8c", // Pink
        "#17a2b8", // Cyan
        "#ffc107", // Yellow
        "#6c757d", // Gray
      ];

      // Function to get color for a unit with partial matching
      const getUnitColor = (unit, index = 0) => {
        if (!unit) return fallbackColors[index % fallbackColors.length];

        const unitLower = unit.toLowerCase();

        // First try: exact match (case-insensitive)
        const exactMatch = Object.keys(unitColorMap).find(
          (key) => key.toLowerCase() === unitLower
        );

        if (exactMatch && unitColorMap[exactMatch]) {
          console.log(
            `🎨 Exact match for "${unit}": ${unitColorMap[exactMatch]}`
          );
          return unitColorMap[exactMatch];
        }

        // Second try: partial match (check if database value contains color map key)
        // e.g., "BERITA RTM" contains "berita", "Radio stations" contains "radio"
        const partialMatch = Object.keys(unitColorMap).find((key) =>
          unitLower.includes(key.toLowerCase())
        );

        if (partialMatch && unitColorMap[partialMatch]) {
          console.log(
            `🎨 Partial match for "${unit}" (contains "${partialMatch}"): ${unitColorMap[partialMatch]}`
          );
          return unitColorMap[partialMatch];
        }

        // Use fallback colors with modulo for unexpected units
        console.warn(
          `⚠️ No color match for unit "${unit}", using fallback color`
        );
        return fallbackColors[index % fallbackColors.length];
      };

      // ========================================
      // BRANCH 1: Use API Database Aggregations (✅ ALWAYS)
      // ========================================
      if (useApiData) {
        console.log("✅ Using accurate API unitsData (respects all filters)");

        // Step 1: Build unit counts from API unitsData
        const unitCounts = {};
        const unitChannelCounts = {};

        unitsData.data.forEach((unitItem) => {
          const unit = unitItem.name === "News" ? "Berita" : unitItem.name;
          unitCounts[unit] = unitItem.totalPosts;

          // Initialize channel container for this unit
          if (!unitChannelCounts[unit]) {
            unitChannelCounts[unit] = {};
          }
        });

        // Step 2: Build channel breakdown from API channelsData
        if (channelsData && channelsData.data && channelsData.data.length > 0) {
          console.log(
            "✅ Using accurate API channelsData for channel breakdown"
          );

          channelsData.data.forEach((channelItem) => {
            const unit =
              channelItem.unit === "News" ? "Berita" : channelItem.unit;
            const channel = channelItem.name;

            if (!unitChannelCounts[unit]) {
              unitChannelCounts[unit] = {};
            }

            unitChannelCounts[unit][channel] = channelItem.totalPosts;
          });
        }

        console.log("📊 API-sourced unit counts:", unitCounts);
        console.log("📊 API-sourced channel counts:", unitChannelCounts);

        // Step 3: Create inner layer data (units) from API
        const innerChartData = Object.entries(unitCounts)
          .map(([unit, count], index) => ({
            name: unit,
            unit: unit,
            mentions: count,
            fill: getUnitColor(unit, index),
            isFiltered: isUnitFiltered(unit),
          }))
          .sort((a, b) => (b as any).mentions - (a as any).mentions);

        // Step 4: Create outer layer data (channels within units) from API
        const outerChartData = [];
        let totalMentionsCount = 0;

        innerChartData.forEach((unitData) => {
          const unitName = unitData.unit;
          const unitChannels = unitChannelCounts[unitName] || {};
          const baseColor = unitData.fill;
          totalMentionsCount += Number(unitData.mentions) || 0;

          // Get channels for this unit and sort by count
          const channelsInUnit = Object.entries(unitChannels).sort(
            (a, b) => (b as any)[1] - (a as any)[1]
          );

          // Generate shades for this unit's channels
          const channelShades = generateShades(
            baseColor,
            channelsInUnit.length
          );

          channelsInUnit.forEach(
            ([channelName, channelCount], channelIndex) => {
              outerChartData.push({
                name: channelName,
                unit: unitName,
                mentions: channelCount,
                fill: channelShades[channelIndex],
                percentage: (
                  ((channelCount as number) / (unitData as any).mentions) *
                  100
                ).toFixed(1),
                unitPercentage: (
                  ((channelCount as number) / totalMentionsCount) *
                  100
                ).toFixed(1),
              });
            }
          );
        });

        // Step 5: Create chart config
        const config = {
          mentions: {
            label: "Mentions",
          },
        };

        innerChartData.forEach((item) => {
          const key = item.unit.toLowerCase().replace(/[^a-z0-9]/g, "");
          config[key] = {
            label: item.unit,
            color: item.fill,
          };
        });

        console.log(
          "✅ Using API data - Inner data:",
          innerChartData.length,
          "units"
        );
        console.log(
          "✅ Using API data - Outer data:",
          outerChartData.length,
          "channels"
        );
        console.log("✅ Using API data - Total mentions:", totalMentionsCount);

        return {
          innerData: innerChartData,
          outerData: outerChartData,
          chartConfig: config,
          totalMentions: totalMentionsCount,
        };
      }

      // ========================================
      // BRANCH 2: Count from Client-Side Filtered Data
      // ========================================
      console.log(
        "⚠️ Counting from client-side filtered data (filters are active)"
      );

      if (!data || !Array.isArray(data) || data.length === 0) {
        return {
          innerData: [],
          outerData: [],
          chartConfig: {},
          totalMentions: 0,
        };
      }

      // Debug: Log the first few data items to understand the structure
      console.log("Data sample:", data.slice(0, 3));
      console.log("Total data length:", data.length);

      // Step 1: Count posts by unit and channel from client data
      const unitCounts = {};
      const channelCounts = {};
      const unitChannelCounts = {};

      data.forEach((item, index) => {
        // Debug: Log what fields are available
        if (index < 3) {
          console.log(`Item ${index}:`, Object.keys(item), item);
        }

        // More flexible field checking - try different possible field names
        const unit =
          item?.unit ||
          item?.Unit ||
          item?.category ||
          item?.type ||
          item?.source;
        const channel =
          item?.author ||
          item?.channel ||
          item?.Channel ||
          item?.name ||
          item?.title ||
          item?.source_name;

        if (unit) {
          const transformedUnit = transformUnitName(unit);

          // Count by unit
          unitCounts[transformedUnit] = (unitCounts[transformedUnit] || 0) + 1;

          if (channel) {
            // Count by channel
            channelCounts[channel] = (channelCounts[channel] || 0) + 1;

            // Count by unit-channel combination
            if (!unitChannelCounts[transformedUnit]) {
              unitChannelCounts[transformedUnit] = {};
            }
            unitChannelCounts[transformedUnit][channel] =
              (unitChannelCounts[transformedUnit][channel] || 0) + 1;
          } else {
            // If no channel, create a default channel name based on unit
            const defaultChannel = `${transformedUnit} Default`;
            channelCounts[defaultChannel] =
              (channelCounts[defaultChannel] || 0) + 1;

            if (!unitChannelCounts[transformedUnit]) {
              unitChannelCounts[transformedUnit] = {};
            }
            unitChannelCounts[transformedUnit][defaultChannel] =
              (unitChannelCounts[transformedUnit][defaultChannel] || 0) + 1;
          }
        }
      });

      console.log("Unit counts:", unitCounts);
      console.log("Channel counts:", channelCounts);
      console.log("Unit-Channel counts:", unitChannelCounts);

      // Step 2: Create inner layer data (units)
      const innerChartData = Object.entries(unitCounts)
        .map(([unit, count], index) => ({
          name: unit,
          unit: unit,
          mentions: count,
          fill: getUnitColor(unit, index), // Use predefined color mapping
          isFiltered: isUnitFiltered(unit),
        }))
        .sort((a, b) => (b as any).mentions - (a as any).mentions);

      // Step 3: Create outer layer data (channels within units)
      const outerChartData = [];

      innerChartData.forEach((unitData, unitIndex) => {
        const unitName = unitData.unit;
        const unitChannels = unitChannelCounts[unitName] || {};
        const baseColor = unitData.fill; // Use the unit's assigned color from innerChartData

        // Get channels for this unit and sort by count
        const channelsInUnit = Object.entries(unitChannels).sort(
          (a, b) => (b as any)[1] - (a as any)[1]
        ); // Sort by count descending

        // Generate shades for this unit's channels
        const channelShades = generateShades(baseColor, channelsInUnit.length);

        channelsInUnit.forEach(([channelName, channelCount], channelIndex) => {
          outerChartData.push({
            name: channelName,
            unit: unitName,
            mentions: channelCount,
            fill: channelShades[channelIndex],
            percentage: (
              ((channelCount as number) / (unitData as any).mentions) *
              100
            ).toFixed(1),
            unitPercentage: (
              ((channelCount as number) / data.length) *
              100
            ).toFixed(1),
          });
        });
      });

      console.log("Inner data:", innerChartData);
      console.log("Outer data:", outerChartData);
      console.log("Unit color mapping:", unitColorMap);
      console.log(
        "Sample inner colors:",
        innerChartData.map((item) => item.fill)
      );
      console.log(
        "Sample outer colors:",
        outerChartData.slice(0, 5).map((item) => item.fill)
      );

      // Step 4: Create chart config
      const config = {
        mentions: {
          label: "Mentions",
        },
      };

      innerChartData.forEach((item, index) => {
        const key = item.unit.toLowerCase().replace(/[^a-z0-9]/g, "");
        config[key] = {
          label: item.unit,
          color: item.fill, // Use the unit's assigned color from innerChartData
        };
      });

      return {
        innerData: innerChartData,
        outerData: outerChartData,
        chartConfig: config,
        totalMentions: data.length,
      };
    }, [
      data,
      unitsData,
      channelsData,
      hasActiveFilters,
      activeFilters,
      isUnitFiltered,
    ]);

  // Unified tooltip that detects which layer is being hovered
  const UnifiedTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const data = payload[0].payload;

    // Check if this is outer layer (has 'unit' property and 'name' is different from 'unit')
    // Outer layer items have both 'name' (channel) and 'unit' properties
    const isOuterLayer = data.unit && data.name && data.name !== data.unit;

    if (isOuterLayer) {
      // Outer layer tooltip - shows channel information
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.fill }}
            ></div>
            <p className="font-semibold text-gray-900">{data.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
              📺 Unit: {data.unit}
            </p>
            <p className="text-sm text-blue-600 font-medium">
              📊 Posts: {data.mentions.toLocaleString()}
            </p>
            {onFilterChange && (
              <p className="text-xs text-gray-400 mt-2 italic border-t pt-1">
                💡 Click to filter by {data.unit}
              </p>
            )}
          </div>
        </div>
      );
    } else {
      // Inner layer tooltip - shows unit information

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.fill }}
            ></div>
            <p className="font-semibold text-gray-900">
              {data.unit || data.name}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-blue-600 font-medium">
              📊 Posts: {data.mentions.toLocaleString()}
            </p>
            {onFilterChange && (
              <p className="text-xs text-gray-400 mt-2 italic border-t pt-1">
                💡 Click to filter by this unit
              </p>
            )}
          </div>
        </div>
      );
    }
  };

  // Loading state - check if we have any data source available
  const hasApiData = unitsData?.data && unitsData.data.length > 0;
  const hasClientData = data && Array.isArray(data) && data.length > 0;

  console.log("🎯 RTMUnitsPieChart Render Check:", {
    hasApiData,
    hasClientData,
    unitsDataLength: unitsData?.data?.length,
    clientDataLength: data?.length,
    innerDataLength: innerData?.length,
    outerDataLength: outerData?.length,
  });

  if (!hasApiData && !hasClientData) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="">
            <div className="text-[24px] font-bold">{title}</div>
          </CardTitle>
          <CardDescription className="">{description}</CardDescription>
        </CardHeader>
        <CardContent className="">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-gray-600 text-sm">Loading chart data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No valid units found
  if (innerData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="">{title}</CardTitle>
          <CardDescription className="">{description}</CardDescription>
        </CardHeader>
        <CardContent className="">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3 text-center">
              <BarChart3 className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-gray-900 font-medium">No unit data found</p>
                <p className="text-gray-500 text-sm">
                  The data doesn&apos;t contain any valid unit information.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col shadow-none" style={{ border: "none" }}>
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-[24px] font-bold">{title}</CardTitle>
        <CardDescription className="">
          {description}
          {(activeFilters?.platform || activeFilters?.channel) && (
            <span className="block text-xs text-blue-600 font-medium mt-1">
              ⚠️ Filtered results - percentages show distribution within active filters
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <div className="mx-auto w-full max-w-[500px] h-[400px] overflow-visible p-4">
          <ResponsiveContainer width={500} height="100%">
            <PieChart>
              {/* Inner layer - Pie chart with unit segments */}
              <Pie
                data={innerData}
                dataKey="mentions"
                nameKey="unit"
                cx="50%"
                cy="50%"
                outerRadius={98}
                strokeWidth={0}
                stroke="#ffffff"
                cursor={onFilterChange ? "pointer" : "default"}
                onClick={handlePieClick}
                className="hover:opacity-90 transition-all duration-200"
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                  name,
                }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 60; // Reduced from 80 to 60 to bring labels closer
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="black"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      className="text-sm font-semibold"
                    >
                      {`${name} (${(percent * 100).toFixed(0)}%)`}
                    </text>
                  );
                }}
                labelLine={false}
              >
                {innerData.map((entry, index) => {
                  console.log(
                    `Inner Cell ${index}: ${entry.unit} -> ${entry.fill}`
                  );
                  return (
                    <Cell
                      key={`inner-cell-${index}`}
                      fill={entry.fill}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  );
                })}
              </Pie>

              {/* Outer layer - Channels within units (Sunburst effect) */}
              <Pie
                data={outerData}
                dataKey="mentions"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={108}
                outerRadius={148}
                strokeWidth={1}
                stroke="#fff"
                cursor={onFilterChange ? "pointer" : "default"}
                onClick={handlePieClick}
                className="hover:opacity-90 transition-all duration-200"
              >
                {outerData.map((entry, index) => {
                  if (index < 5)
                    console.log(
                      `Outer Cell ${index}: ${entry.name} -> ${entry.fill}`
                    );
                  return (
                    <Cell
                      key={`outer-cell-${index}`}
                      fill={entry.fill}
                      stroke="#ffffff"
                      strokeWidth={1}
                    />
                  );
                })}
              </Pie>

              {/* Single unified Tooltip for both layers */}
              <Tooltip content={<UnifiedTooltip />} />

              {/* Center label */}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalMentions.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-sm"
                        >
                          {activeFilters?.unit ? "Filtered" : "Total"} Posts
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="mt-2 grid grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-items-center">
          {innerData.map((item, index) => {
            const percentage = ((item.mentions / totalMentions) * 100).toFixed(
              1
            );
            const color = item.fill;
            const isFiltered = isUnitFiltered(item.unit);
            const hasActiveFilter = activeFilters?.unit;

            return (
              <div
                key={item.unit}
                className={`bg-muted/50 rounded-lg p-2 flex flex-row items-center justify-center gap-1.5 transition-all duration-200 ${
                  onFilterChange
                    ? "cursor-pointer hover:bg-muted/80 hover:shadow-sm active:bg-muted"
                    : ""
                } ${
                  isFiltered
                    ? "ring-2 ring-blue-500 bg-blue-50/50 shadow-md"
                    : hasActiveFilter
                    ? "opacity-50"
                    : ""
                }`}
                onClick={() => handleStatCardClick(item.unit)}
                style={getFilteredStyle(item.unit)}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-200 ${
                    isFiltered ? "ring-2 ring-blue-400" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
                <span
                  className={`text-sm font-medium ${
                    isFiltered ? "text-blue-900" : "text-foreground"
                  }`}
                >
                  {item.unit}
                  {isFiltered && <span className="ml-1 text-blue-600">●</span>}
                </span>
                <span
                  className={`text-sm font-bold ${
                    isFiltered ? "text-blue-900" : "text-foreground"
                  }`}
                >
                  ({item.mentions.toLocaleString()})
                </span>
              </div>
            );
          })}
        </div>

        {/* Cross-filtering hint */}
        {onFilterChange && (
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-400 italic">
              💡 Click on pie slices or unit cards to filter other charts
              {activeFilters?.unit && (
                <span className="text-blue-600 font-medium ml-2">
                  (Currently filtering by: {activeFilters.unit})
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Inner ring: Units by total posts • Outer ring: Channels
              proportional within each unit
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RTMUnitsPieChart;

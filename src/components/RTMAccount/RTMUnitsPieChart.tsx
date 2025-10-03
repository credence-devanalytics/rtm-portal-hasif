"use client";
import * as React from "react";
import { useCallback } from "react";
import { Label, Pie, PieChart, Cell } from "recharts";
import { BarChart3, Loader2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const RTMUnitsPieChart = ({
  data = [],
  title = "RTM Units Posts Distribution",
  description = "Distribution of posts across RTM units",
  onFilterChange = null, // Prop for cross-filtering
  activeFilters = {}, // New prop to receive active filters from parent
}: any) => {
  // Function to transform unit names
  const transformUnitName = (unit) => {
    if (unit === "News") {
      return "Berita";
    }
    return unit;
  };

  // Handle click on pie slices
  const handlePieClick = (data, index, event) => {
    if (onFilterChange && data && data.payload) {
      // In Recharts, the actual data is in the payload property
      const unitValue = data.payload.unit;
      console.log("Pie click - Unit value:", unitValue); // Debug log
      onFilterChange("unit", unitValue);
    }
  };

  // Handle click on summary stat cards
  const handleStatCardClick = (unit) => {
    if (onFilterChange) {
      console.log("Stat card click - Unit value:", unit); // Debug log
      onFilterChange("unit", unit);
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
      return activeFilters?.unit === unit;
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
      // Define colors array inside useMemo to avoid re-creation
      const colors = [
        "#4E5899", // Primary: Blue-purple
        "#ff9705", // Secondary: Orange
        "#28a745", // Third: Green
        "#dc3545", // Fourth: Red
        "#6f42c1", // Fifth: Purple
        "#20c997", // Sixth: Teal
        "#fd7e14", // Seventh: Orange variant
        "#e83e8c", // Eighth: Pink
      ];

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

      // Step 1: Count posts by unit and channel
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
          fill: colors[index % colors.length],
          isFiltered: isUnitFiltered(unit),
        }))
        .sort((a, b) => (b as any).mentions - (a as any).mentions);

      // Step 3: Create outer layer data (channels within units)
      const outerChartData = [];

      innerChartData.forEach((unitData, unitIndex) => {
        const unitName = unitData.unit;
        const unitChannels = unitChannelCounts[unitName] || {};
        const baseColor = colors[unitIndex % colors.length];

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
      console.log("Colors being used:", colors);
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
          color: colors[index % colors.length],
        };
      });

      return {
        innerData: innerChartData,
        outerData: outerChartData,
        chartConfig: config,
        totalMentions: data.length,
      };
    }, [data, isUnitFiltered]);

  // Custom tooltip for inner layer (units)
  const CustomInnerTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      const percentage = ((data.mentions / totalMentions) * 100).toFixed(1);
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.fill }}
            ></div>
            <p className="font-semibold text-gray-900">{data.unit}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-blue-600 font-medium">
              📊 Posts: {data.mentions.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              📈 {percentage}% of total posts
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for outer layer (channels)
  const CustomOuterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
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
            <p className="text-sm text-green-600">
              📈 {data.percentage}% of {data.unit} posts
            </p>
            <p className="text-xs text-gray-500">
              🎯 {data.unitPercentage}% of all posts
            </p>
            <div className="flex gap-2 mt-2">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">
                  Within {data.unit}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${data.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (!data) {
    return (
      <Card className="flex flex-col">
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

  // Empty state
  if (!Array.isArray(data) || data.length === 0) {
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
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-gray-900 font-medium">No data available</p>
                <p className="text-gray-500 text-sm">
                  There are no mentions to display in the chart.
                </p>
              </div>
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
      <CardHeader className="items-center ">
        <CardTitle className="text-[24px] font-bold">{title}</CardTitle>
        <CardDescription className="">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer
          id="rtm-units-chart"
          config={chartConfig}
          className="mx-auto aspect-square h-[450px]"
        >
          <PieChart>
            {/* Inner layer - Pie chart with unit segments */}
            <Pie
              data={innerData}
              dataKey="mentions"
              nameKey="unit"
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={100}
              strokeWidth={0}
              stroke="#ffffff"
              cursor={onFilterChange ? "pointer" : "default"}
              onClick={handlePieClick}
              className="hover:opacity-90 transition-all duration-200"
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
              <ChartTooltip
                cursor={true}
                content={
                  <CustomInnerTooltip active={undefined} payload={undefined} />
                }
                animationDuration={200}
                offset={10}
                allowEscapeViewBox={{ x: false, y: false }}
              />
            </Pie>

            {/* Outer layer - Channels within units (Sunburst effect) */}
            <Pie
              data={outerData}
              dataKey="mentions"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={110}
              outerRadius={150}
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
              <ChartTooltip
                cursor={false}
                content={
                  <CustomOuterTooltip active={undefined} payload={undefined} />
                }
                animationDuration={200}
                offset={10}
                allowEscapeViewBox={{ x: false, y: false }}
              />
            </Pie>

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
        </ChartContainer>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                className={`bg-muted/50 rounded-lg p-3 text-center transition-all duration-200 ${
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
                  className={`w-3 h-3 rounded-full mx-auto mb-2 transition-all duration-200 ${
                    isFiltered ? "ring-2 ring-blue-400" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
                <p
                  className={`text-xs font-medium mb-1 ${
                    isFiltered ? "text-blue-900" : "text-foreground"
                  }`}
                >
                  {item.unit}
                  {isFiltered && <span className="ml-1 text-blue-600">●</span>}
                </p>
                <p
                  className={`text-lg font-bold ${
                    isFiltered ? "text-blue-900" : "text-foreground"
                  }`}
                >
                  {item.mentions.toLocaleString()}
                </p>
                <p
                  className={`text-xs ${
                    isFiltered ? "text-blue-700" : "text-muted-foreground"
                  }`}
                >
                  {percentage}%
                </p>
              </div>
            );
          })}
        </div>

        {/* Cross-filtering hint */}
        {onFilterChange && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400 italic">
              💡 Click on pie slices or unit cards to filter other charts
              {activeFilters?.unit && (
                <span className="text-blue-600 font-medium ml-2">
                  (Currently filtering by: {activeFilters.unit})
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
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

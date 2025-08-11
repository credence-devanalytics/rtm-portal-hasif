"use client";
import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import { BarChart3, Loader2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const RTMUnitsPieChart = ({
  data = [],
  title = "RTM Units Mentions Distribution",
  description = "Distribution of mentions across RTM units",
}) => {
  // Function to transform unit names
  const transformUnitName = (unit) => {
    if (unit === "News") {
      return "Berita";
    }
    return unit;
  };

  // Process data to get unit counts and prepare chart data
  const { chartData, chartConfig, totalMentions } = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { chartData: [], chartConfig: {}, totalMentions: 0 };
    }

    const unitCounts = data.reduce((acc, item) => {
      if (item?.unit) {
        const transformedUnit = transformUnitName(item.unit);
        acc[transformedUnit] = (acc[transformedUnit] || 0) + 1;
      }
      return acc;
    }, {});

    const processedData = Object.entries(unitCounts)
      .map(([unit, count]) => ({
        unit: unit,
        mentions: count,
        fill: `var(--color-${unit.toLowerCase().replace(/[^a-z0-9]/g, "")})`,
      }))
      .sort((a, b) => b.mentions - a.mentions);

    // Create dynamic chart config
    const config = {
      mentions: {
        label: "Mentions",
      },
    };

    const colors = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
      "var(--chart-6)",
      "var(--chart-7)",
      "var(--chart-8)",
    ];

    processedData.forEach((item, index) => {
      const key = item.unit.toLowerCase().replace(/[^a-z0-9]/g, "");
      config[key] = {
        label: item.unit,
        color: colors[index % colors.length],
      };
    });

    return {
      chartData: processedData,
      chartConfig: config,
      totalMentions: data.length,
    };
  }, [data]);

  // Loading state
  if (!data) {
    return (
      <Card className="flex flex-col">
        <CardContent>
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
          <CardTitle>
            <div className="text-[24px] font-bold">{title}</div>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
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
  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3 text-center">
              <BarChart3 className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-gray-900 font-medium">No unit data found</p>
                <p className="text-gray-500 text-sm">
                  The data doesn't contain any valid unit information.
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
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[400px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="mentions"
              nameKey="unit"
              innerRadius={60}
              strokeWidth={5}
            >
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
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalMentions.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Mentions
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {chartData.map((item, index) => {
            const percentage = ((item.mentions / totalMentions) * 100).toFixed(
              1
            );
            const colorKey = item.unit.toLowerCase().replace(/[^a-z0-9]/g, "");
            const color = chartConfig[colorKey]?.color || "var(--chart-1)";

            return (
              <div
                key={item.unit}
                className="bg-muted/50 rounded-lg p-3 text-center hover:bg-muted transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: color }}
                />
                <p className="text-xs font-medium text-foreground mb-1">
                  {item.unit}
                </p>
                <p className="text-lg font-bold text-foreground">
                  {item.mentions.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{percentage}%</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RTMUnitsPieChart;

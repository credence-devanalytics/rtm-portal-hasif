// src/components/dashboard.js
"use client";

import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard({ data }) {
  // Sample transform: group by Category and count
  const chartData = Object.values(
    data.reduce((acc, item) => {
      const key = item.Category || "Unknown";
      acc[key] = acc[key] || { name: key, value: 0 };
      acc[key].value += 1;
      return acc;
    }, {})
  );

  return (
    <div className="w-full h-[400px]">
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              content={
                <ChartTooltipContent
                  config={{
                    value: { label: "Mentions", color: "#6366f1" },
                    name: { label: "Category" },
                  }}
                />
              }
            />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

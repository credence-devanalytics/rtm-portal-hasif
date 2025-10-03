import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const HourlyViewershipHeatmap = ({ unifiData, loading }) => {
  const heatmapData = React.useMemo(() => {
    if (!unifiData?.data) {
      // Generate mock hourly data
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const hours = Array.from({ length: 24 }, (_, i) => i);

      return days
        .map((day) =>
          hours.map((hour) => ({
            day,
            hour,
            intensity: Math.random() * 100,
            viewers: Math.floor(Math.random() * 50000) + 10000,
          }))
        )
        .flat();
    }

    // Process actual data to create hourly patterns
    const hourlyMap = new Map();

    unifiData.data.forEach((item) => {
      if (item.start_time) {
        const hour = parseInt(item.start_time.split(":")[0]);
        const day = new Date(item.programme_date).toLocaleDateString("en", {
          weekday: "short",
        });
        const key = `${day}-${hour}`;

        const existing = hourlyMap.get(key) || {
          day,
          hour,
          intensity: 0,
          viewers: 0,
          count: 0,
        };
        hourlyMap.set(key, {
          ...existing,
          intensity: existing.intensity + (item.mau || 0),
          viewers: existing.viewers + (item.mau || 0),
          count: existing.count + 1,
        });
      }
    });

    // Convert to array and normalize intensity
    const data = Array.from(hourlyMap.values());
    const maxIntensity = Math.max(...data.map((d) => d.intensity));

    return data.map((d) => ({
      ...d,
      intensity: maxIntensity > 0 ? (d.intensity / maxIntensity) * 100 : 0,
    }));
  }, [unifiData]);

  const getIntensityColor = (intensity) => {
    if (intensity > 80) return "bg-red-500";
    if (intensity > 60) return "bg-orange-500";
    if (intensity > 40) return "bg-yellow-500";
    if (intensity > 20) return "bg-blue-400";
    if (intensity > 0) return "bg-blue-200";
    return "bg-gray-100";
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  if (loading) {
    return (
      <Card className="">
        <CardHeader className="">
          <CardTitle className="">Hourly Viewership Heatmap</CardTitle>
          <CardDescription className="">Peak viewing times visualization</CardDescription>
        </CardHeader>
        <CardContent className="">
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-gray-500">Loading heatmap data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="">
      <CardHeader className="">
        <CardTitle className="">Hourly Viewership Heatmap</CardTitle>
        <CardDescription className="">Peak viewing patterns by day and hour</CardDescription>
      </CardHeader>
      <CardContent className="">
        <div className="space-y-2">
          {/* Hour labels */}
          <div className="flex">
            <div className="w-12"></div>
            <div className="flex-1 grid grid-cols-24 gap-1">
              {hours.map((hour) => (
                <div key={hour} className="text-xs text-center text-gray-500">
                  {hour % 6 === 0 ? `${hour}h` : ""}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap grid */}
          {days.map((day) => (
            <div key={day} className="flex items-center">
              <div className="w-12 text-xs text-gray-600 font-medium">
                {day}
              </div>
              <div className="flex-1 grid grid-cols-24 gap-1">
                {hours.map((hour) => {
                  const dataPoint = heatmapData.find(
                    (d) => d.day === day && d.hour === hour
                  );
                  const intensity = dataPoint?.intensity || 0;

                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={`h-6 rounded ${getIntensityColor(
                        intensity
                      )} cursor-pointer transition-all hover:scale-110`}
                      title={`${day} ${hour}:00 - ${
                        dataPoint?.viewers?.toLocaleString() || 0
                      } viewers`}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-gray-600">
            <span>Low</span>
            <div className="flex space-x-1">
              <div className="w-4 h-4 bg-gray-100 rounded"></div>
              <div className="w-4 h-4 bg-blue-200 rounded"></div>
              <div className="w-4 h-4 bg-blue-400 rounded"></div>
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <div className="w-4 h-4 bg-red-500 rounded"></div>
            </div>
            <span>High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HourlyViewershipHeatmap;

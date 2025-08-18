import React, { useMemo } from "react";
import { TrendingUp, Users, MessageCircle, BarChart3 } from "lucide-react";

const RTMMediaTable = ({ data = [] }) => {
  // Process data to get aggregated statistics by unit
  const aggregatedData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        "Official Account": { posts: 0, reach: 0, interactions: 0, total: 0 },
        TV: { posts: 0, reach: 0, interactions: 0, total: 0 },
        Berita: { posts: 0, reach: 0, interactions: 0, total: 0 },
        Radio: { posts: 0, reach: 0, interactions: 0, total: 0 },
      };
    }

    const stats = {
      "Official Account": { posts: 0, reach: 0, interactions: 0, total: 0 },
      TV: { posts: 0, reach: 0, interactions: 0, total: 0 },
      Berita: { posts: 0, reach: 0, interactions: 0, total: 0 },
      Radio: { posts: 0, reach: 0, interactions: 0, total: 0 },
    };

    data.forEach((item) => {
      // Map units to our display categories
      let category;
      switch (item.unit?.toLowerCase()) {
        case "tv":
          category = "TV";
          break;
        case "radio":
          category = "Radio";
          break;
        case "news":
        case "berita":
          category = "Berita";
          break;
        default:
          category = "Official Account";
      }

      if (stats[category]) {
        stats[category].posts += 1;
        stats[category].reach += Number(item.reach || 0);
        stats[category].interactions += Number(item.interactions || 0);
      }
    });

    // Calculate totals (sum of posts, reach, and interactions)
    Object.keys(stats).forEach((key) => {
      stats[key].total =
        stats[key].posts + stats[key].reach + stats[key].interactions;
    });

    return stats;
  }, [data]);

  // Format numbers with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-MY").format(num);
  };

  // Loading state
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4 w-64"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-300 rounded flex-1"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tableRows = [
    { label: "Official Account", data: aggregatedData["Official Account"] },
    { label: "TV", data: aggregatedData["TV"] },
    { label: "Berita", data: aggregatedData["Berita"] },
    { label: "Radio", data: aggregatedData["Radio"] },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="w-full bg-white rounded-lg px-6 py-4 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          Overall RTM Media Social
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Social media performance overview by unit
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Unit
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                <div className="flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  Total Posts
                </div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  Total Reach
                </div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  Total Engagements
                </div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                <div className="flex items-center justify-center gap-2">
                  <BarChart3 className="w-4 h-4 text-orange-600" />
                  Overall Total
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tableRows.map((row, index) => (
              <tr
                key={row.label}
                className={`hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-25"
                }`}
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{row.label}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {formatNumber(row.data.posts)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {formatNumber(row.data.reach)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {formatNumber(row.data.interactions)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {formatNumber(row.data.total)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with summary */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex flex-wrap justify-between items-center text-sm text-gray-600 gap-4">
          <div className="flex items-center gap-4">
            <span>
              Total Records: <strong>{data?.length || 0}</strong>
            </span>
            <span>•</span>
            <span>
              Grand Total Posts:{" "}
              <strong>
                {formatNumber(
                  Object.values(aggregatedData).reduce(
                    (sum, unit) => sum + unit.posts,
                    0
                  )
                )}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>
              Total Reach:{" "}
              <strong>
                {formatNumber(
                  Object.values(aggregatedData).reduce(
                    (sum, unit) => sum + unit.reach,
                    0
                  )
                )}
              </strong>
            </span>
            <span>•</span>
            <span>
              Total Engagement:{" "}
              <strong>
                {formatNumber(
                  Object.values(aggregatedData).reduce(
                    (sum, unit) => sum + unit.interactions,
                    0
                  )
                )}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {data?.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Data Available
          </h3>
          <p className="text-gray-500">
            No social media mentions found to display.
          </p>
        </div>
      )}
    </div>
  );
};

export default RTMMediaTable;

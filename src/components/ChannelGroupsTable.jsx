"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChannelGroupsData } from "@/hooks/useChannelGroupsData";
import { Search, Radio, Tv, FileText, Users } from "lucide-react";

const ChannelGroupsTable = ({ filterType = "all" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("count"); // 'count', 'alphabetical', 'channelgroup'

  const { data, isLoading, error } = useChannelGroupsData(filterType);

  // Get the icon for filter type
  const getFilterIcon = () => {
    switch (filterType) {
      case "radio":
        return <Radio className="h-5 w-5" />;
      case "tv":
        return <Tv className="h-5 w-5" />;
      case "news":
        return <FileText className="h-5 w-5" />;
      case "official":
        return <Users className="h-5 w-5" />;
      default:
        return <Search className="h-5 w-5" />;
    }
  };

  // Filter and sort data based on search term and sort preference
  const processedData = React.useMemo(() => {
    if (!data?.data?.sqlFormat) return [];

    let filtered = data.data.sqlFormat.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (item.groupname || "").toLowerCase().includes(searchLower) ||
        (item.channel || "").toLowerCase().includes(searchLower) ||
        (item.channelgroup || "").toLowerCase().includes(searchLower)
      );
    });

    // Sort the data
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "count":
          return b.count - a.count;
        case "alphabetical":
          return (a.channel || "").localeCompare(b.channel || "");
        case "channelgroup":
          return (a.channelgroup || "").localeCompare(b.channelgroup || "");
        default:
          return b.count - a.count;
      }
    });

    return filtered;
  }, [data, searchTerm, sortBy]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getFilterIcon()}
            Channel Groups - Loading...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            {getFilterIcon()}
            Channel Groups - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 p-4">
            Error loading channel groups: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  const summary = data?.meta?.summary || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getFilterIcon()}
            Channel Groups Analysis
            <span className="text-sm font-normal text-gray-500">
              (
              {filterType === "all"
                ? "All Categories"
                : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              )
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {processedData.length} combinations
          </div>
        </CardTitle>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {summary.totalRecords?.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Records</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {summary.uniqueChannelGroups}
            </div>
            <div className="text-sm text-gray-600">Channel Groups</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {summary.uniqueChannels}
            </div>
            <div className="text-sm text-gray-600">Unique Channels</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {summary.uniqueGroups}
            </div>
            <div className="text-sm text-gray-600">Group Names</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups, channels, or channel groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[150px]"
          >
            <option value="count">Sort by Count</option>
            <option value="alphabetical">Sort by Channel</option>
            <option value="channelgroup">Sort by Channel Group</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-700">
                  Group Name
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Channel
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Channel Group
                </th>
                <th className="text-right p-4 font-semibold text-gray-700">
                  Count
                </th>
              </tr>
            </thead>
            <tbody>
              {processedData.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="p-4">
                    <span className="font-medium text-gray-900">
                      {row.groupname || "N/A"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-700">
                      {row.channel || "N/A"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        row.channelgroup
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {row.channelgroup || "Unassigned"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-semibold text-gray-900">
                      {row.count?.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {processedData.length === 0 && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Results Found
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? `No channel groups match "${searchTerm}"`
                : "No channel group data available"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChannelGroupsTable;

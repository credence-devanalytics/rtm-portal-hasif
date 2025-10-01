"use client";

import React, { useState } from "react";
import ChannelGroupsTable from "@/components/ChannelGroupsTable";

const ChannelGroupsTestPage = () => {
  const [selectedFilter, setSelectedFilter] = useState("radio");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Channel Groups Analysis
        </h1>
        <p className="text-gray-600 mb-6">
          Test page for the new{" "}
          <code className="bg-gray-100 px-2 py-1 rounded">channelgroup</code>{" "}
          column functionality. This shows the relationship between{" "}
          <code className="bg-gray-100 px-2 py-1 rounded">groupname</code>,
          <code className="bg-gray-100 px-2 py-1 rounded">channel</code>, and
          <code className="bg-gray-100 px-2 py-1 rounded">
            channelgroup
          </code>{" "}
          fields.
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "all", label: "All Categories", color: "gray" },
            { key: "radio", label: "Radio Stations", color: "blue" },
            { key: "tv", label: "TV Channels", color: "green" },
            { key: "news", label: "News Channels", color: "red" },
            { key: "official", label: "Official Channels", color: "purple" },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === filter.key
                  ? `bg-${filter.color}-100 text-${filter.color}-700 border-2 border-${filter.color}-300`
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* SQL Query Reference */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Reference SQL Query:
          </h3>
          <code className="text-sm text-gray-600 font-mono">
            SELECT groupname, channel, channelgroup, count(*) FROM
            mentions_classify
            {selectedFilter !== "all" && (
              <>
                <br />
                WHERE LOWER(groupname) LIKE '%{selectedFilter}%'
              </>
            )}
            <br />
            GROUP BY groupname, channel, channelgroup
            <br />
            ORDER BY channelgroup;
          </code>
        </div>
      </div>

      {/* Channel Groups Table */}
      <ChannelGroupsTable filterType={selectedFilter} />

      {/* API Endpoint Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">
          API Endpoint:
        </h3>
        <code className="text-sm text-blue-600">
          GET /api/channel-groups?type={selectedFilter}
        </code>
        <p className="text-sm text-blue-700 mt-2">
          This endpoint provides the channel group analysis data with the new
          channelgroup column.
        </p>
      </div>
    </div>
  );
};

export default ChannelGroupsTestPage;

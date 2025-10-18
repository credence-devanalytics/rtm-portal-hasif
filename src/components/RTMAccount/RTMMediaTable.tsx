import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const RTMMediaTable = ({
  data = [],
  selectedTab = "overall",
  onFilterChange,
}) => {
  // State to track the current active tab from RTMTabs
  const [currentTab, setCurrentTab] = useState("overall");
  // State to track whether to show all radio channels or just top 5
  const [showAllRadioChannels, setShowAllRadioChannels] = useState(false);
  // State to track sorting
  const [sortBy, setSortBy] = useState(null); // 'posts', 'reach', 'interactions', 'groupname'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'

  // Radio channel groups mapping
  const radioChannelGroups = {
    "STESEN DAERAH": [
      "LIMBANGfm",
      "SABAH Vfm",
      "WAIfm (BIDAYUH)",
      "SIBUfm",
      "REDfm",
      "SANDAKANfm",
      "TAWAUfm",
      "BINTULUfm",
      "SRI AMANfm",
      "KENINGAUfm",
      "MIRIfm",
    ],
    "STESEN IBU PEJABAT": [
      "MINNALfm",
      "NASIONALfm",
      "TRAXXfm",
      "ASYIKfm",
      "Aifm",
      "RADIO KLASIK",
    ],
    "STESEN NEGERI": [
      "KLfm",
      "SELANGORfm",
      "MELAKAfm",
      "PERAKfm",
      "TERENGGANUfm",
      "MUTIARAfm",
      "PERLISfm",
      "LABUANfm",
      "KEDAHfm",
      "NEGERIfm",
      "JOHORfm",
      "PAHANGfm",
      "SABAHfm",
      "KELANTANfm",
      "SARAWAKfm",
      "LANGKAWIfm",
    ],
  };

  // Function to get the group name for a radio channel
  const getRadioChannelGroup = (channelName) => {
    for (const [groupName, channels] of Object.entries(radioChannelGroups)) {
      if (channels.includes(channelName)) {
        return groupName;
      }
    }
    return null;
  };

  // Channel mapping based on your requirements
  const channelMapping = {
    Berita: ["Berita BES"],
    Official: ["RTM"],
    Radio: [
      "ASYIKfm",
      "Aifm",
      "BINTULUfm",
      "JOHORfm",
      "KEDAHfm",
      "KELANTANfm",
      "KENINGAUfm",
      "LABUANfm",
      "LANGKAWIfm",
      "LIMBANGfm",
      "MELAKAfm",
      "MINNALfm",
      "MIRIfm",
      "MUTIARAfm",
      "NASIONALfm",
      "NEGERIfm",
      "PAHANGfm",
      "PERAKfm",
      "RADIO KLASIK",
      "SABAHfm",
      "SANDAKANfm",
      "SELANGORfm",
      "SIBUfm",
      "SPPR",
      "SRI AMANfm",
      "TERENGGANUfm",
      "TRAXXfm",
      "WAIfm (BIDAYUH)",
    ],
    TV: ["Sukan", "TV Okey", "TV1", "TV2", "TV6"],
  };

  // Get all unique channels for a unit
  const getAllChannelsForUnit = (unit) => {
    return channelMapping[unit] || [];
  };

  // Update current tab when selectedTab prop changes
  useEffect(() => {
    setCurrentTab(selectedTab);
    // Reset show all radio channels when tab changes
    if (selectedTab !== "radio") {
      setShowAllRadioChannels(false);
    }
    // Reset sorting when tab changes
    setSortBy(null);
    setSortOrder("desc");
  }, [selectedTab]);

  // Handle sorting
  const handleSort = (sortType) => {
    if (sortBy === sortType) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort column and default to descending
      setSortBy(sortType);
      setSortOrder("desc");
    }
  };

  // Process data based on current tab
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let result = [];

    if (currentTab === "overall") {
      // Show unit-level data (Official Account, TV, Berita, Radio)
      const units = ["Official", "TV", "Berita", "Radio"];

      result = units.map((unit) => {
        let filteredData = [];

        if (unit === "Official") {
          filteredData = data.filter(
            (item) => item.unit === "Official" || item.author === "RTM"
          );
        } else if (unit === "TV") {
          filteredData = data.filter((item) => item.unit === "TV");
        } else if (unit === "Berita") {
          filteredData = data.filter((item) => item.unit === "News");
        } else if (unit === "Radio") {
          filteredData = data.filter((item) => item.unit === "Radio");
        }

        const totalPosts = filteredData.length;
        const totalReach = filteredData.reduce(
          (sum, item) => sum + (item.reach || 0),
          0
        );
        const totalInteractions = filteredData.reduce(
          (sum, item) => sum + (item.interactions || 0),
          0
        );
        const overallTotal = totalPosts + totalReach + totalInteractions;

        return {
          name: unit,
          totalPosts,
          totalReach,
          totalInteractions,
          overallTotal,
          data: filteredData,
        };
      });
    } else {
      // Show channel-level data based on selected tab
      let channels = [];
      let unitFilter = "";

      switch (currentTab) {
        case "official":
          channels = channelMapping.Official;
          unitFilter = "Official";
          break;
        case "tv":
          channels = channelMapping.TV;
          unitFilter = "TV";
          break;
        case "berita":
          channels = channelMapping.Berita;
          unitFilter = "News";
          break;
        case "radio":
          channels = channelMapping.Radio;
          unitFilter = "Radio";
          break;
        default:
          return [];
      }

      result = channels.map((channel) => {
        // Filter data by unit and try to match channel name in author or other fields
        const filteredData = data.filter((item) => {
          if (currentTab === "official") {
            return item.unit === unitFilter || item.author === channel;
          }
          return (
            item.unit === unitFilter &&
            (item.author?.includes(channel) ||
              item.mentionSnippet?.includes(channel) ||
              item.author === channel)
          );
        });

        const totalPosts = filteredData.length;
        const totalReach = filteredData.reduce(
          (sum, item) => sum + (item.reach || 0),
          0
        );
        const totalInteractions = filteredData.reduce(
          (sum, item) => sum + (item.interactions || 0),
          0
        );
        const overallTotal = totalPosts + totalReach + totalInteractions;

        return {
          name: channel,
          totalPosts,
          totalReach,
          totalInteractions,
          overallTotal,
          data: filteredData,
          groupName:
            currentTab === "radio" ? getRadioChannelGroup(channel) : null,
        };
      });
    }

    // Apply sorting
    if (sortBy && result.length > 0) {
      result.sort((a, b) => {
        let compareValue = 0;

        switch (sortBy) {
          case "posts":
            compareValue = a.totalPosts - b.totalPosts;
            break;
          case "reach":
            compareValue = a.totalReach - b.totalReach;
            break;
          case "interactions":
            compareValue = a.totalInteractions - b.totalInteractions;
            break;
          case "groupname":
            // Sort by group name (only for radio channels)
            if (a.groupName && b.groupName) {
              compareValue = a.groupName.localeCompare(b.groupName);
            } else if (a.groupName) {
              compareValue = -1;
            } else if (b.groupName) {
              compareValue = 1;
            }
            break;
          default:
            compareValue = 0;
        }

        return sortOrder === "asc" ? compareValue : -compareValue;
      });
    }

    // For radio channels, limit to top 5 unless showing all (after sorting)
    if (currentTab === "radio" && !showAllRadioChannels && result.length > 5) {
      result = result.slice(0, 5);
    }

    return result;
  }, [
    data,
    currentTab,
    showAllRadioChannels,
    sortBy,
    sortOrder,
    channelMapping.Official,
    channelMapping.TV,
    channelMapping.Berita,
    channelMapping.Radio,
  ]);

  // Handle row click for filtering
  const handleRowClick = (rowData) => {
    if (onFilterChange && rowData.data && rowData.data.length > 0) {
      // Instead of filtering by the data itself, we'll trigger a global filter
      // Based on the row type (unit or channel)
      if (currentTab === "overall") {
        // Filter by unit
        onFilterChange(
          "unit",
          rowData.name === "Official" ? "Other" : rowData.name
        );
      } else {
        // Filter by author/channel
        onFilterChange("author", rowData.name);
      }
    }
  };

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toLocaleString();
  };

  // Loading state
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">
            Overall RTM Social Media
          </h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading data...</span>
        </div>
      </div>
    );
  }

  const getHeaderTitle = () => {
    switch (currentTab) {
      case "overall":
        return "Units";
      case "official":
        return "Official Channels";
      case "tv":
        return "TV Channels";
      case "berita":
        return "Berita Channels";
      case "radio":
        return "Radio Channels";
      default:
        return "Channels";
    }
  };
  console.log("Processed Data:", currentTab);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Overall RTM Social Media
          </h2>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-1/4">
                <div className="flex items-center gap-2">
                  {getHeaderTitle()}
                  {currentTab === "radio" && (
                    <button
                      onClick={() => handleSort("groupname")}
                      className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Sort by Group Name"
                    >
                      {sortBy === "groupname" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="h-4 w-4 text-gray-700" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-gray-700" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 w-1/5">
                <button
                  onClick={() => handleSort("posts")}
                  className="flex items-center justify-center gap-2 w-full hover:bg-gray-100 rounded py-1 transition-colors"
                  title="Sort by Total Posts"
                >
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  Total Posts
                  {sortBy === "posts" ? (
                    sortOrder === "asc" ? (
                      <ArrowUp className="h-4 w-4 text-gray-700" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-gray-700" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 w-1/5">
                <button
                  onClick={() => handleSort("reach")}
                  className="flex items-center justify-center gap-2 w-full hover:bg-gray-100 rounded py-1 transition-colors"
                  title="Sort by Total Reach"
                >
                  <Users className="h-4 w-4 text-green-600" />
                  Total Reach
                  {sortBy === "reach" ? (
                    sortOrder === "asc" ? (
                      <ArrowUp className="h-4 w-4 text-gray-700" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-gray-700" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 w-1/5">
                <button
                  onClick={() => handleSort("interactions")}
                  className="flex items-center justify-center gap-2 w-full hover:bg-gray-100 rounded py-1 transition-colors"
                  title="Sort by Total Interactions"
                >
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  Total Interactions
                  {sortBy === "interactions" ? (
                    sortOrder === "asc" ? (
                      <ArrowUp className="h-4 w-4 text-gray-700" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-gray-700" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {processedData.map((row, index) => {
              const isRadioChannel = currentTab === "radio";
              const radioGroup = isRadioChannel
                ? getRadioChannelGroup(row.name)
                : null;

              return (
                <tr
                  key={row.name}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(row)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900">
                        {row.name}
                      </div>
                      {radioGroup && (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            radioGroup === "STESEN IBU PEJABAT"
                              ? "bg-blue-100 text-blue-800"
                              : radioGroup === "STESEN NEGERI"
                              ? "bg-green-100 text-green-800"
                              : radioGroup === "STESEN DAERAH"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {radioGroup}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {formatNumber(row.totalPosts)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm font-medium text-green-600">
                      {formatNumber(row.totalReach)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm font-medium text-purple-600">
                      {formatNumber(row.totalInteractions)}
                    </div>
                  </td>
                </tr>
              );
            })}
            {/* Empty placeholder rows to maintain consistent height */}
            {Array.from({
              length: Math.max(
                0,
                (currentTab === "overall" ? 4 : 5) - processedData.length
              ),
            }).map((_, index) => (
              <tr key={`empty-${index}`} className="h-16">
                <td className="px-6 py-4">
                  <div className="h-6"></div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="h-6"></div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="h-6"></div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="h-6"></div>
                </td>
              </tr>
            ))}
          </tbody>
          {/* Footer with totals - only show for overall tab */}
          {currentTab === "overall" && (
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td className="px-6 py-4 font-bold text-gray-900">TOTAL</td>
                <td className="px-6 py-4 text-center font-bold text-gray-900">
                  {formatNumber(
                    processedData.reduce((sum, row) => sum + row.totalPosts, 0)
                  )}
                </td>
                <td className="px-6 py-4 text-center font-bold text-green-600">
                  {formatNumber(
                    processedData.reduce((sum, row) => sum + row.totalReach, 0)
                  )}
                </td>
                <td className="px-6 py-4 text-center font-bold text-purple-600">
                  {formatNumber(
                    processedData.reduce(
                      (sum, row) => sum + row.totalInteractions,
                      0
                    )
                  )}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Show More/Less Button for Radio Channels */}
      {currentTab === "radio" && channelMapping.Radio.length > 5 && (
        <div className="px-6 py-4 bg-gray-50 border-t">
          <button
            onClick={() => setShowAllRadioChannels(!showAllRadioChannels)}
            className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            {showAllRadioChannels ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less ({channelMapping.Radio.length - 5} channels hidden)
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show More ({channelMapping.Radio.length - 5} more channels)
              </>
            )}
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {/* <div className="bg-gray-50 p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {processedData.length}
          </div>
          <div className="text-sm text-gray-600">
            {currentTab === "overall" ? "Units" : "Channels"}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(
              processedData.reduce((sum, row) => sum + row.totalPosts, 0)
            )}
          </div>
          <div className="text-sm text-gray-600">Total Posts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {formatNumber(
              processedData.reduce((sum, row) => sum + row.totalReach, 0)
            )}
          </div>
          <div className="text-sm text-gray-600">Total Reach</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {formatNumber(
              processedData.reduce((sum, row) => sum + row.totalInteractions, 0)
            )}
          </div>
          <div className="text-sm text-gray-600">Total Interactions</div>
        </div>
      </div> */}
    </div>
  );
};

export default RTMMediaTable;

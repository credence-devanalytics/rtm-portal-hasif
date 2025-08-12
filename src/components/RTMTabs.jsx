import React, { useState } from "react";

const Tabs = ({ value, onValueChange, className = "", children }) => (
  <div className={`w-full ${className}`}>{children}</div>
);

const TabsList = ({ className = "", children }) => (
  <div
    className={`inline-flex h-12 items-center justify-center rounded-xl bg-white p-1.5 text-slate-500 shadow-md border border-slate-200 backdrop-blur-sm ${className}`}
  >
    {children}
  </div>
);

const TabsTrigger = ({
  value,
  activeValue,
  onValueChange,
  className = "",
  children,
}) => (
  <button
    onClick={() => onValueChange(value)}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
      activeValue === value
        ? "bg-slate-900 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    } ${className}`}
  >
    {children}
  </button>
);

const RTMTabs = ({ data = [], onFilterChange }) => {
  const [activeTab, setActiveTab] = useState("overall");

  const filterByUnit = (tabId) => {
    switch (tabId) {
      case "official":
        return data.filter(
          (item) =>
            item.unit === "Official Account" ||
            item.isInfluencer === true ||
            item.followerCount > 50000
        );
      case "tv":
        return data.filter(
          (item) =>
            item.unit === "TV" ||
            item.unit?.toLowerCase().includes("tv") ||
            item.platform === "YouTube"
        );
      case "berita":
        return data.filter(
          (item) =>
            item.unit === "News" ||
            item.unit === "Berita" ||
            item.unit?.toLowerCase().includes("news") ||
            item.unit?.toLowerCase().includes("berita")
        );
      case "radio":
        return data.filter(
          (item) =>
            item.unit === "Radio" || item.unit?.toLowerCase().includes("radio")
        );
      default:
        return data;
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    onFilterChange?.(filterByUnit(tabId)); // send filtered data to parent
  };

  const tabs = [
    { id: "overall", label: "RTM Overall" },
    { id: "official", label: "RTM Official Account" },
    { id: "tv", label: "TV" },
    { id: "berita", label: "Berita" },
    { id: "radio", label: "Radio" },
  ];

  return (
    <div className="w-full flex justify-center">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-5 w-full max-w-full">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              activeValue={activeTab}
              onValueChange={handleTabChange}
              className="px-3 lg:px-4 text-xs lg:text-sm flex-1"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default RTMTabs;

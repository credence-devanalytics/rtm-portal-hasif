import React, { useState } from "react";

// Placeholder components - replace these with your actual components
const RTMOverall = ({ data }) => <div className=""></div>;

const RTMOffAcc = ({ data }) => {
  const officialAccountData =
    data?.filter(
      (item) =>
        item.unit === "Official Account" ||
        item.isInfluencer === true ||
        item.followerCount > 50000
    ) || [];

  return (
    <div className="">
      {/* Add your official account specific components here */}
    </div>
  );
};

const TV = ({ data }) => {
  const tvData =
    data?.filter(
      (item) =>
        item.unit === "TV" ||
        item.unit?.toLowerCase().includes("tv") ||
        item.platform === "YouTube"
    ) || [];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        TV Content Analytics
      </h2>
      <p className="text-gray-600 mb-4">
        Television and video content performance metrics
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{tvData.length}</div>
          <div className="text-sm text-red-800">TV Mentions</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {tvData
              .reduce((sum, item) => sum + (item.viewCount || 0), 0)
              .toLocaleString()}
          </div>
          <div className="text-sm text-orange-800">Total Views</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {Math.round(
              tvData.reduce((sum, item) => sum + (item.viewCount || 0), 0) /
                Math.max(tvData.length, 1)
            ).toLocaleString()}
          </div>
          <div className="text-sm text-yellow-800">Avg Views per Content</div>
        </div>
      </div>
      {/* Add your TV specific components here */}
    </div>
  );
};

const Berita = ({ data }) => {
  const beritaData =
    data?.filter(
      (item) =>
        item.unit === "News" ||
        item.unit === "Berita" ||
        item.unit?.toLowerCase().includes("news") ||
        item.unit?.toLowerCase().includes("berita")
    ) || [];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Berita (News) Analytics
      </h2>
      <p className="text-gray-600 mb-4">News content and coverage analysis</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-teal-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-teal-600">
            {beritaData.length}
          </div>
          <div className="text-sm text-teal-800">News Articles</div>
        </div>
        <div className="bg-cyan-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-cyan-600">
            {beritaData
              .reduce((sum, item) => sum + (item.reach || 0), 0)
              .toLocaleString()}
          </div>
          <div className="text-sm text-cyan-800">Total Reach</div>
        </div>
      </div>
      {/* Add your news specific components here */}
    </div>
  );
};

const Radio = ({ data }) => {
  const radioData =
    data?.filter(
      (item) =>
        item.unit === "Radio" || item.unit?.toLowerCase().includes("radio")
    ) || [];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Radio Analytics</h2>
      <p className="text-gray-600 mb-4">
        Radio content and listener engagement metrics
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-violet-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-violet-600">
            {radioData.length}
          </div>
          <div className="text-sm text-violet-800">Radio Mentions</div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-emerald-600">
            {radioData
              .reduce((sum, item) => sum + (item.interactions || 0), 0)
              .toLocaleString()}
          </div>
          <div className="text-sm text-emerald-800">Total Interactions</div>
        </div>
      </div>
      {/* Add your radio specific components here */}
    </div>
  );
};

// Custom Tabs components (shadcn-style)
const Tabs = ({ value, onValueChange, className = "", children, ...props }) => (
  <div className={`w-full ${className}`} {...props}>
    {children}
  </div>
);

const TabsList = ({ className = "", children, ...props }) => (
  <div
    className={`inline-flex h-12 items-center justify-center rounded-xl bg-white p-1.5 text-slate-500 shadow-md border border-slate-200 backdrop-blur-sm relative z-10 ${className}`}
    {...props}
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
  ...props
}) => (
  <button
    onClick={() => onValueChange(value)}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      activeValue === value
        ? "bg-slate-900 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

const TabsContent = ({
  value,
  activeValue,
  className = "",
  children,
  ...props
}) => {
  if (value !== activeValue) return null;

  return (
    <div
      className={`mt-8 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const RTMTabs = ({ data = [] }) => {
  const [activeTab, setActiveTab] = useState("overall");

  const tabs = [
    { id: "overall", label: "RTM Overall", component: RTMOverall },
    { id: "official", label: "RTM Official Account", component: RTMOffAcc },
    { id: "tv", label: "TV", component: TV },
    { id: "berita", label: "Berita", component: Berita },
    { id: "radio", label: "Radio", component: Radio },
  ];

  return (
    <div className="w-full relative h-10">
      {/* Floating Tab Navigation */}
      <div className="flex justify-center relative z-20 -mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full max-w-full">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                activeValue={activeTab}
                onValueChange={setActiveTab}
                className=" px-3 lg:px-4 text-xs lg:text-sm flex-1"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content with padding to accommodate floating tabs */}
      <div className="pt-8 relative z-10">
        <Tabs value={activeTab}>
          {tabs.map((tab) => {
            const Component = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} activeValue={activeTab}>
                <Component data={data} />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
      {/* Optional: Background blur effect */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-50/80 to-transparent pointer-events-none z-0" />
    </div>
  );
};

export default RTMTabs;

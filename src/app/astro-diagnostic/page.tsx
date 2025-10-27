"use client";

import { useState, useEffect } from "react";

export default function AstroDiagnosticPage() {
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching from /api/astro-rate-reach...");
        const response = await fetch("/api/astro-rate-reach");
        console.log("Response status:", response.status);

        const data = await response.json();
        console.log("API Response:", data);

        setApiResponse(data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Astro API Diagnostic</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">
          Astro API Diagnostic - Error
        </h1>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  const metrics = calculateMetrics(apiResponse);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Astro Rate & Reach API Diagnostic
      </h1>

      {/* API Status */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">API Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Success:</span>
            <span
              className={`ml-2 ${
                apiResponse?.success ? "text-green-600" : "text-red-600"
              }`}
            >
              {apiResponse?.success ? "✓ Yes" : "✗ No"}
            </span>
          </div>
          <div>
            <span className="font-medium">Records Found:</span>
            <span className="ml-2">{apiResponse?.data?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Calculated Metrics */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Calculated Metrics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50 rounded border border-purple-200">
            <h3 className="font-semibold text-sm text-purple-900 mb-2">
              Top Rated Channel
            </h3>
            <p className="text-lg font-bold">{metrics.topRatedChannel.name}</p>
            <p className="text-sm text-gray-600">
              Rating: {metrics.topRatedChannel.rating}
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded border border-blue-200">
            <h3 className="font-semibold text-sm text-blue-900 mb-2">
              Top Reach Channel
            </h3>
            <p className="text-lg font-bold">{metrics.topReachChannel.name}</p>
            <p className="text-sm text-gray-600">
              Reach: {metrics.topReachChannel.reach.toLocaleString()}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded border border-green-200">
            <h3 className="font-semibold text-sm text-green-900 mb-2">
              Total Reach
            </h3>
            <p className="text-lg font-bold">
              {metrics.totalReach.toLocaleString()}
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded border border-amber-200">
            <h3 className="font-semibold text-sm text-amber-900 mb-2">
              Lowest Rating Channel
            </h3>
            <p className="text-lg font-bold">
              {metrics.lowestRatingChannel.name}
            </p>
            <p className="text-sm text-gray-600">
              Rating: {metrics.lowestRatingChannel.rating}
            </p>
          </div>
        </div>
      </div>

      {/* Record Type Breakdown */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Record Type Breakdown</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Rating Records:</span>
            <span className="ml-2">{metrics.ratingCount}</span>
          </div>
          <div>
            <span className="font-medium">Reach Records:</span>
            <span className="ml-2">{metrics.reachCount}</span>
          </div>
        </div>
      </div>

      {/* Sample Data */}
      {apiResponse?.data?.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Sample Data (First 10 Records)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Channel
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Metric Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiResponse.data.slice(0, 10).map((record) => (
                  <tr key={record.id}>
                    <td className="px-4 py-2 text-sm">{record.id}</td>
                    <td className="px-4 py-2 text-sm">{record.txDate}</td>
                    <td className="px-4 py-2 text-sm font-medium">
                      {record.channel}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          record.metricType === "rating"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {record.metricType}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm font-bold">
                      {record.value.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Raw API Response */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Raw API Response</h2>
        <pre className="text-xs overflow-x-auto bg-white p-4 rounded border">
          {JSON.stringify(apiResponse, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function calculateMetrics(apiResponse) {
  if (
    !apiResponse?.success ||
    !apiResponse?.data ||
    apiResponse.data.length === 0
  ) {
    return {
      hasData: false,
      topRatedChannel: { name: "No data", rating: 0 },
      topReachChannel: { name: "No data", reach: 0 },
      totalReach: 0,
      lowestRatingChannel: { name: "No data", rating: 0 },
      ratingCount: 0,
      reachCount: 0,
    };
  }

  const records = apiResponse.data;

  // Separate rating and reach records - using metricType (camelCase)
  const ratingRecords = records.filter((r) => r.metricType === "rating");
  const reachRecords = records.filter((r) => r.metricType === "reach");

  // Calculate top rated channel
  const topRated = ratingRecords.reduce(
    (max, record) => (record.value > max.value ? record : max),
    { channel: "No data", value: 0 }
  );

  // Calculate channel with most reach
  const topReach = reachRecords.reduce(
    (max, record) => (record.value > max.value ? record : max),
    { channel: "No data", value: 0 }
  );

  // Calculate total reach
  const totalReach = reachRecords.reduce(
    (sum, record) => sum + (record.value || 0),
    0
  );

  // Calculate lowest rating channel
  const nonZeroRatings = ratingRecords.filter((r) => r.value > 0);
  const lowestRated =
    nonZeroRatings.length > 0
      ? nonZeroRatings.reduce(
          (min, record) => (record.value < min.value ? record : min),
          nonZeroRatings[0]
        )
      : { channel: "No data", value: 0 };

  return {
    hasData: true,
    topRatedChannel: {
      name: topRated.channel,
      rating: topRated.value,
    },
    topReachChannel: {
      name: topReach.channel,
      reach: topReach.value,
    },
    totalReach,
    lowestRatingChannel: {
      name: lowestRated.channel,
      rating: lowestRated.value,
    },
    ratingCount: ratingRecords.length,
    reachCount: reachRecords.length,
  };
}

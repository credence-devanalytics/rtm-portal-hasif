import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Using the same data data source from your original component

const SentimentBarChart = ({ data }) => {
  // Now data will default to an empty array if undefined
  const overallSentiment = data.reduce(
    (totals, item) => {
      totals[item.sentiment] = (totals[item.sentiment] || 0) + 1;
      return totals;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );

  console.log("overallSentiment from component", data.sentiment);
  // Convert to array format for BarChart
  const chartData = [
    {
      sentiment: "Positive",
      count: overallSentiment.positive,
      fill: "#10B981",
    },
    { sentiment: "Neutral", count: overallSentiment.neutral, fill: "#6B7280" },
    {
      sentiment: "Negative",
      count: overallSentiment.negative,
      fill: "#EF4444",
    },
  ];

  return (
    <div className="w-full p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Overall Sentiment Breakdown
        </h2>
        <p className="text-gray-600">
          Total sentiment analysis across all mentions
        </p>
      </div>

      <div className="w-full">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sentiment" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill={(entry) => entry.fill} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentBarChart;

// import React from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// // Using the same data data source from your original component

// const SentimentBarChart = ({ data }) => {
//   // Now data will default to an empty array if undefined
//   const overallSentiment = data.reduce(
//     (totals, item) => {
//       totals[item.sentiment] = (totals[item.sentiment] || 0) + 1;
//       return totals;
//     },
//     { positive: 0, neutral: 0, negative: 0 }
//   );

//   console.log("overallSentiment from component", data.sentiment);
//   // Convert to array format for PieChart
//   const chartData = [
//     {
//       sentiment: "Positive",
//       count: overallSentiment.positive,
//       fill: "#10B981",
//     },
//     { sentiment: "Neutral", count: overallSentiment.neutral, fill: "#6B7280" },
//     {
//       sentiment: "Negative",
//       count: overallSentiment.negative,
//       fill: "#EF4444",
//     },
//   ];

//   return (
//     <div className="w-full p-6 bg-white">
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-900 mb-2">
//           Overall Sentiment Breakdown
//         </h2>
//         <p className="text-gray-600">
//           Total sentiment analysis across all mentions
//         </p>
//       </div>

//       <div className="w-full">
//         <ResponsiveContainer width="100%" height={400}>
//           <PieChart>
//             <Pie
//               data={chartData}
//               cx="50%"
//               cy="50%"
//               outerRadius={120}
//               dataKey="count"
//               nameKey="sentiment"
//             >
//               {chartData.map((entry, index) => (
//                 <Cell key={`cell-${index}`} fill={entry.fill} />
//               ))}
//             </Pie>
//             <Tooltip />
//             <Legend />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default SentimentBarChart;

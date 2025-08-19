import React, { useState, useEffect, useMemo } from "react";
import { WordCloud } from "@ant-design/charts";
import { Loader2, MessageSquare, TrendingUp } from "lucide-react";

const SocialMediaWordCloud = ({
  data = [],
  title = "Most Mentioned Words",
}) => {
  const [loading, setLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [data]);

  // Process mentionSnippet text to extract frequent words
  const wordCloudData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    // Words to exclude (common stop words)
    const stopWords = new Set([
      "the",
      "yang",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "must",
      "can",
      "this",
      "that",
      "these",
      "those",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "me",
      "him",
      "her",
      "us",
      "them",
      "my",
      "your",
      "his",
      "her",
      "its",
      "our",
      "their",
      "am",
      "pm",
      "etc",
      "also",
      "just",
      "only",
      "very",
      "even",
      "more",
      "most",
      "much",
      "many",
      "some",
      "any",
      "all",
      "each",
      "every",
      "no",
      "not",
      "now",
      "then",
      "here",
      "there",
      "when",
      "where",
      "why",
      "how",
      "what",
      "who",
      "which",
      "than",
      "so",
      "too",
      "as",
      "if",
    ]);

    // Extract and count words from mentionSnippet
    const wordFreq = {};
    const wordSentiments = {};

    data.forEach((item) => {
      if (item.mentionSnippet) {
        // Clean and split the text into words
        const words = item.mentionSnippet
          .toLowerCase()
          .replace(/[^\w\s]/g, " ") // Remove punctuation
          .split(/\s+/) // Split by whitespace
          .filter(
            (word) =>
              word.length > 2 && // Minimum length
              !stopWords.has(word) && // Not a stop word
              !/^\d+$/.test(word) // Not just numbers
          );

        words.forEach((word) => {
          wordFreq[word] = (wordFreq[word] || 0) + 1;

          // Track sentiment distribution for each word
          if (!wordSentiments[word]) {
            wordSentiments[word] = { positive: 0, negative: 0, neutral: 0 };
          }
          wordSentiments[word][item.sentiment] =
            (wordSentiments[word][item.sentiment] || 0) + 1;
        });
      }
    });

    // Convert to format required by WordCloud component
    const words = Object.entries(wordFreq)
      .map(([word, count]) => {
        const sentiments = wordSentiments[word];
        const total =
          sentiments.positive + sentiments.negative + sentiments.neutral;

        // Determine dominant sentiment for color
        let color = "#1890ff"; // Default blue for neutral/mixed
        if (sentiments.positive / total > 0.6)
          color = "#52c41a"; // Green for positive
        else if (sentiments.negative / total > 0.6) color = "#ff4d4f"; // Red for negative

        return {
          text: word,
          value: count,
          color: color,
          sentiments: sentiments,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 80); // Show top 80 words for better visualization

    return words;
  }, [data]);

  // WordCloud configuration
  const config = {
    data: wordCloudData,
    wordField: "text",
    weightField: "value",
    colorField: "text",
    wordStyle: {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: [14, 60],
      rotation: [0], // Allow some rotation for better layout
      rotationSteps: 0,
      padding: 5,
    },
    // Custom color based on sentiment
    color: (datum) => {
      return datum.color || "#1890ff";
    },
    // Layout configuration
    spiral: "archimedean",
    placementStrategy: "force",
    // Size configuration
    width: 800,
    height: 400,
    // Interactions
    interactions: [
      {
        type: "element-active",
      },
    ],
    // Tooltip configuration
    tooltip: {
      formatter: (datum) => {
        const word = wordCloudData.find((w) => w.text === datum.text);
        if (!word) return { name: datum.text, value: datum.value };

        return {
          name: datum.text,
          value: `${datum.value} mentions`,
          // Add sentiment breakdown
          title: `Sentiment: +${word.sentiments.positive} | -${word.sentiments.negative} | ~${word.sentiments.neutral}`,
        };
      },
    },
    // Animation
    animation: {
      appear: {
        animation: "fade-in",
        duration: 1000,
      },
    },
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Analyzing word frequency...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          {title}
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No data available for word cloud</p>
          </div>
        </div>
      </div>
    );
  }

  if (wordCloudData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          {title}
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No words found in mention snippets</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          {title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4" />
          {wordCloudData.length} unique words from {data.length} mentions
        </div>
      </div>

      {/* Word Cloud */}
      <div className="w-full">
        <WordCloud {...config} />
      </div>

      {/* Legend */}
      {/* <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Positive sentiment</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Negative sentiment</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Neutral/Mixed sentiment</span>
        </div>
        <div className="ml-auto text-gray-500">
          Size indicates frequency • Hover for sentiment details
        </div>
      </div> */}

      {/* Top Words Summary */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">
          Most Mentioned Words:
        </h4>
        <div className="flex flex-wrap gap-2">
          {wordCloudData.slice(0, 10).map((word, index) => (
            <span
              key={word.text}
              className="px-2 py-1 bg-white rounded text-sm border"
              style={{ color: word.color }}
            >
              {word.text} ({word.value})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaWordCloud;

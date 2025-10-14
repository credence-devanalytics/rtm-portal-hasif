/**
 * Top Authors Table Component
 * Displays statistics for top authors/accounts with sentiment breakdown
 */

"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  TrendingUp,
  Award,
  Hash,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const TopAuthorsTable = ({
  data,
  isLoading,
  activeFilters,
  sortConfig,
  onSortChange,
  onAuthorClick,
}) => {
  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  // Get sentiment badge color
  const getSentimentColor = (type) => {
    switch (type) {
      case "positive":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "negative":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "neutral":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    }
  };

  // Calculate dominant sentiment
  const getDominantSentiment = (positive, negative, neutral) => {
    const max = Math.max(positive, negative, neutral);
    if (max === positive) return "positive";
    if (max === negative) return "negative";
    return "neutral";
  };

  // Handle sorting - communicate back to parent
  const handleSort = (column) => {
    if (!onSortChange) return;

    const columnMap = {
      followers: "followers",
      totalPosts: "totalPosts",
    };

    const sortBy = columnMap[column];
    if (!sortBy) return;

    // Toggle sort order if clicking the same column
    const newSortOrder =
      sortConfig?.sortBy === sortBy && sortConfig?.sortOrder === "desc"
        ? "asc"
        : "desc";

    onSortChange(sortBy, newSortOrder);
  };

  // Get sort icon
  const getSortIcon = (column) => {
    const columnMap = {
      followers: "followers",
      totalPosts: "totalPosts",
    };

    const mappedColumn = columnMap[column];

    if (!sortConfig || sortConfig.sortBy !== mappedColumn) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }

    return sortConfig.sortOrder === "desc" ? (
      <ArrowDown className="h-4 w-4 ml-1" />
    ) : (
      <ArrowUp className="h-4 w-4 ml-1" />
    );
  };

  // Handle author row click
  const handleAuthorRowClick = (author) => {
    if (onAuthorClick) {
      console.log("🎯 Author clicked:", author);
      onAuthorClick("author", author);
    }
  };

  // Handle sentiment badge click within author row
  const handleSentimentBadgeClick = (e, author, sentiment) => {
    e.stopPropagation(); // Prevent row click
    if (onAuthorClick) {
      console.log("🎯 Author + Sentiment clicked:", { author, sentiment });
      onAuthorClick({ type: "author", author, sentiment });
    }
  };

  // Check if an author is currently filtered
  const isAuthorFiltered = (author) => {
    return activeFilters?.authors?.includes(author) || false;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Authors by Mentions
          </CardTitle>
          <CardDescription>
            Loading top contributing authors and their sentiment statistics...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="h-16 w-full bg-gray-100 animate-pulse rounded-md"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Authors by Mentions
          </CardTitle>
          <CardDescription>
            Most active authors and their sentiment distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No author data available for the selected filters</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Top Authors by Mentions
        </CardTitle>
        <CardDescription>
          Most active authors and their sentiment distribution across all posts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Author Name</TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 font-medium hover:bg-gray-100"
                    onClick={() => handleSort("followers")}
                  >
                    Followers
                    {getSortIcon("followers")}
                  </Button>
                </TableHead>
                <TableHead>Top Topic</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Positive
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    Negative
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    Neutral
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 font-medium hover:bg-gray-100"
                    onClick={() => handleSort("totalPosts")}
                  >
                    Total Posts
                    {getSortIcon("totalPosts")}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((author, index) => {
                const dominantSentiment = getDominantSentiment(
                  author.positiveCount,
                  author.negativeCount,
                  author.neutralCount
                );
                const isFiltered = isAuthorFiltered(author.author);

                return (
                  <TableRow
                    key={author.author}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      isFiltered
                        ? "bg-indigo-50 border-l-4 border-indigo-500"
                        : ""
                    }`}
                    onClick={() => handleAuthorRowClick(author.author)}
                  >
                    <TableCell className="font-medium text-gray-500">
                      {index === 0 && (
                        <Award className="h-5 w-5 text-yellow-500" />
                      )}
                      {index === 1 && (
                        <Award className="h-5 w-5 text-gray-400" />
                      )}
                      {index === 2 && (
                        <Award className="h-5 w-5 text-amber-600" />
                      )}
                      {index > 2 && <span>{index + 1}</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span
                          className={`font-medium ${
                            isFiltered ? "text-indigo-900" : ""
                          }`}
                        >
                          {author.author}
                          {isFiltered && (
                            <Badge
                              variant="outline"
                              className="ml-2 bg-indigo-100 text-indigo-800 text-xs"
                            >
                              Filtered
                            </Badge>
                          )}
                        </span>
                        <Badge
                          variant="outline"
                          className={`w-fit mt-1 cursor-pointer ${getSentimentColor(
                            dominantSentiment
                          )}`}
                          onClick={(e) =>
                            handleSentimentBadgeClick(
                              e,
                              author.author,
                              dominantSentiment
                            )
                          }
                        >
                          {dominantSentiment}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {formatNumber(author.followersCount)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 w-fit"
                      >
                        <Hash className="h-3 w-3" />
                        {author.topTopic}
                        {author.topicCount > 1 && (
                          <span className="text-xs text-gray-500">
                            +{author.topicCount - 1}
                          </span>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-colors"
                        onClick={(e) =>
                          handleSentimentBadgeClick(
                            e,
                            author.author,
                            "positive"
                          )
                        }
                      >
                        {author.positiveCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className="bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer transition-colors"
                        onClick={(e) =>
                          handleSentimentBadgeClick(
                            e,
                            author.author,
                            "negative"
                          )
                        }
                      >
                        {author.negativeCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className="bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer transition-colors"
                        onClick={(e) =>
                          handleSentimentBadgeClick(e, author.author, "neutral")
                        }
                      >
                        {author.neutralCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold text-blue-600">
                          {formatNumber(author.totalPosts)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-500">Total Authors</div>
              <div className="text-lg font-bold text-gray-900">
                {data.length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Total Posts</div>
              <div className="text-lg font-bold text-blue-600">
                {formatNumber(
                  data.reduce((sum, author) => sum + author.totalPosts, 0)
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Total Followers</div>
              <div className="text-lg font-bold text-purple-600">
                {formatNumber(
                  data.reduce((sum, author) => sum + author.followersCount, 0)
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Avg Posts/Author</div>
              <div className="text-lg font-bold text-green-600">
                {(
                  data.reduce((sum, author) => sum + author.totalPosts, 0) /
                  data.length
                ).toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopAuthorsTable;

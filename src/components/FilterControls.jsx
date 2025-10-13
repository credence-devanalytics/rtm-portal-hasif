import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Filter,
  X,
  Calendar,
  Smile,
  Frown,
  Meh,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  User,
} from "lucide-react";
import {
  SENTIMENT_OPTIONS,
  SOURCE_OPTIONS,
  filterUtils,
  DEFAULT_FILTERS,
} from "@/lib/types/filters";
import { cn } from "@/lib/utils";

const FilterControls = ({ filters, onFiltersChange, className }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = filterUtils.getActiveFilterCount(filters);

  // Get sentiment icon
  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return <Smile className="h-4 w-4" />;
      case "negative":
        return <Frown className="h-4 w-4" />;
      case "neutral":
        return <Meh className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Get source icon
  const getSourceIcon = (source) => {
    if (!source) return null;

    switch (source.toLowerCase()) {
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      case "twitter":
        return <Twitter className="h-4 w-4" />;
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4" />;
      case "youtube":
        return <Youtube className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Handle sentiment toggle
  const handleSentimentToggle = (sentiment) => {
    const newSentiments = localFilters.sentiments.includes(sentiment)
      ? localFilters.sentiments.filter((s) => s !== sentiment)
      : [...localFilters.sentiments, sentiment];

    setLocalFilters((prev) => ({
      ...prev,
      sentiments: newSentiments,
    }));
  };

  // Handle source toggle
  const handleSourceToggle = (source) => {
    const newSources = localFilters.sources.includes(source)
      ? localFilters.sources.filter((s) => s !== source)
      : [...localFilters.sources, source];

    setLocalFilters((prev) => ({
      ...prev,
      sources: newSources,
    }));
  };

  // Handle date range change
  const handleDateRangeChange = (field, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value,
      },
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = filterUtils.clearAll();
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  // Reset to current filters when dialog opens
  const handleDialogOpen = (open) => {
    setIsOpen(open);
    if (open) {
      setLocalFilters(filters);
    }
  };

  // Remove individual filter
  const removeFilter = (type, value) => {
    if (type === "sentiment") {
      const newFilters = {
        ...filters,
        sentiments: filters.sentiments.filter((s) => s !== value),
      };
      onFiltersChange(newFilters);
    } else if (type === "source") {
      const newFilters = {
        ...filters,
        sources: filters.sources.filter((s) => s !== value),
      };
      onFiltersChange(newFilters);
    } else if (type === "author") {
      const newFilters = {
        ...filters,
        authors: filters.authors.filter((a) => a !== value),
      };
      onFiltersChange(newFilters);
    } else if (type === "dateRange") {
      const newFilters = {
        ...filters,
        dateRange: DEFAULT_FILTERS.dateRange,
      };
      onFiltersChange(newFilters);
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Active filters display */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Sentiment filters */}
        {filters.sentiments.map((sentiment) => {
          const option = SENTIMENT_OPTIONS.find(
            (opt) => opt.value === sentiment
          );
          return (
            <Badge
              key={sentiment}
              variant="outline"
              className={cn("gap-1", option?.color)}
            >
              {getSentimentIcon(sentiment)}
              {option?.label || sentiment}
              <button
                onClick={() => removeFilter("sentiment", sentiment)}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}

        {/* Source filters */}
        {filters.sources.map((source) => {
          const option = SOURCE_OPTIONS.find((opt) => opt.value === source);
          return (
            <Badge
              key={source}
              variant="outline"
              className={cn("gap-1", option?.color)}
            >
              {getSourceIcon(source)}
              {option?.label || source}
              <button
                onClick={() => removeFilter("source", source)}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}

        {/* Author filters */}
        {filters.authors &&
          filters.authors.map((author) => (
            <Badge
              key={author}
              variant="outline"
              className="gap-1 bg-indigo-100 text-indigo-800"
            >
              <User className="h-4 w-4" />
              {author}
              <button
                onClick={() => removeFilter("author", author)}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

        {/* Date range filter */}
        {(filters.dateRange.from || filters.dateRange.to) && (
          <Badge
            variant="outline"
            className="gap-1 bg-purple-100 text-purple-800"
          >
            <Calendar className="h-4 w-4" />
            Date Range
            <button
              onClick={() => removeFilter("dateRange")}
              className="ml-1 hover:bg-black/10 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>

      {/* Filter dialog trigger */}
      <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant={activeFilterCount > 0 ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Filter Social Media Mentions</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Sentiment Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {SENTIMENT_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        localFilters.sentiments.includes(option.value)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleSentimentToggle(option.value)}
                      className="gap-2"
                    >
                      {getSentimentIcon(option.value)}
                      {option.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Source Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Platform Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {SOURCE_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        localFilters.sources.includes(option.value)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleSourceToggle(option.value)}
                      className="gap-2"
                    >
                      {getSourceIcon(option.value)}
                      {option.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Date Range Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Date Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      From Date
                    </label>
                    <Input
                      type="date"
                      value={localFilters.dateRange.from}
                      onChange={(e) =>
                        handleDateRangeChange("from", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      To Date
                    </label>
                    <Input
                      type="date"
                      value={localFilters.dateRange.to}
                      onChange={(e) =>
                        handleDateRangeChange("to", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear All
            </Button>
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick clear all button when filters are active */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          Clear All
        </Button>
      )}
    </div>
  );
};

export { FilterControls };

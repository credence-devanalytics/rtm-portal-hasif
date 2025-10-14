"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
	Search,
	Filter,
	X,
	Calendar,
	Globe,
	MessageSquare,
	Tag as TagIcon,
	RotateCcw,
} from "lucide-react";
import { cn } from "@/utils/mention-utils";

interface MentionsFilterBarProps {
	filters: {
		days: number;
		platform?: string;
		sentiment?: string;
		topic?: string;
	};
	onFiltersChange: (filters: MentionsFilterBarProps["filters"]) => void;
	availableTopics?: string[];
	className?: string;
}

const TIME_RANGES = [
	{ value: 1, label: "Last 24 hours" },
	{ value: 7, label: "Last 7 days" },
	{ value: 30, label: "Last 30 days" },
	{ value: 90, label: "Last 3 months" },
	{ value: 365, label: "Last year" },
];

const PLATFORMS = [
	{ value: "all", label: "All Platforms" },
	{ value: "facebook", label: "Facebook" },
	{ value: "instagram", label: "Instagram" },
	{ value: "twitter", label: "Twitter" },
	{ value: "tiktok", label: "TikTok" },
	{ value: "youtube", label: "YouTube" },
	{ value: "linkedin", label: "LinkedIn" },
	{ value: "reddit", label: "Reddit" },
];

const SENTIMENTS = [
	{ value: "all", label: "All Sentiments" },
	{ value: "positive", label: "Positive" },
	{ value: "negative", label: "Negative" },
	{ value: "neutral", label: "Neutral" },
];

export function MentionsFilterBar({
	filters,
	onFiltersChange,
	availableTopics = [],
	className,
}: MentionsFilterBarProps) {
	const [searchInput, setSearchInput] = useState("");
	const [activeTab, setActiveTab] = useState("filters");

	// Get unique topics from available topics
	const uniqueTopics = Array.from(
		new Set(availableTopics.filter(Boolean))
	).sort();

	// Update filters when values change
	const updateFilters = (
		newFilters: Partial<MentionsFilterBarProps["filters"]>
	) => {
		const updatedFilters = { ...filters, ...newFilters };
		// Remove undefined filter values to avoid API issues
		Object.keys(updatedFilters).forEach((key) => {
			if (
				updatedFilters[key as keyof typeof updatedFilters] === "all" ||
				updatedFilters[key as keyof typeof updatedFilters] === undefined ||
				updatedFilters[key as keyof typeof updatedFilters] === "undefined"
			) {
				delete updatedFilters[key as keyof typeof updatedFilters];
			}
		});
		onFiltersChange(updatedFilters);
	};

	// Clear all filters
	const clearFilters = () => {
		setSearchInput("");
		onFiltersChange({ days: 30 });
	};

	// Handle search
	const handleSearch = (value: string) => {
		setSearchInput(value);
		// If search contains topic-like terms, update topic filter
		const matchedTopic = uniqueTopics.find((topic) =>
			topic.toLowerCase().includes(value.toLowerCase())
		);
		if (matchedTopic && value.length > 2) {
			updateFilters({ topic: matchedTopic });
		} else if (value.length === 0) {
			updateFilters({ topic: undefined });
		}
	};

	// Check if any non-default filters are applied
	const hasActiveFilters =
		filters.days !== 30 ||
		filters.platform !== "all" ||
		filters.sentiment !== "all" ||
		filters.topic !== undefined ||
		searchInput.length > 0;

	return (
		<Card className={cn("w-full", className)}>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg flex items-center gap-2">
						<Filter className="w-5 h-5" />
						Filters
					</CardTitle>
					{hasActiveFilters && (
						<Button
							variant="ghost"
							size="sm"
							onClick={clearFilters}
							className="text-muted-foreground hover:text-foreground"
						>
							<RotateCcw className="w-4 h-4 mr-1" />
							Clear All
						</Button>
					)}
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Search Bar */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						placeholder="Search mentions, topics, or authors..."
						value={searchInput}
						onChange={(e) => handleSearch(e.target.value)}
						className="pl-10"
					/>
					{searchInput && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleSearch("")}
							className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
						>
							<X className="w-3 h-3" />
						</Button>
					)}
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="filters">Quick Filters</TabsTrigger>
						<TabsTrigger value="advanced">Advanced</TabsTrigger>
					</TabsList>

					<TabsContent value="filters" className="space-y-4 mt-4">
						{/* Time Range */}
						<div className="space-y-2">
							<label className="text-sm font-medium flex items-center gap-2">
								<Calendar className="w-4 h-4" />
								Time Range
							</label>
							<Select
								value={filters.days.toString()}
								onValueChange={(value) =>
									updateFilters({ days: parseInt(value) })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{TIME_RANGES.map((range) => (
										<SelectItem
											key={range.value}
											value={range.value.toString()}
										>
											{range.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Platform */}
						<div className="space-y-2">
							<label className="text-sm font-medium flex items-center gap-2">
								<Globe className="w-4 h-4" />
								Platform
							</label>
							<Select
								value={filters.platform || "all"}
								onValueChange={(value) =>
									updateFilters({
										platform: value === "all" ? undefined : value,
									})
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{PLATFORMS.map((platform) => (
										<SelectItem key={platform.value} value={platform.value}>
											{platform.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Sentiment */}
						<div className="space-y-2">
							<label className="text-sm font-medium flex items-center gap-2">
								<MessageSquare className="w-4 h-4" />
								Sentiment
							</label>
							<Select
								value={filters.sentiment || "all"}
								onValueChange={(value) =>
									updateFilters({
										sentiment: value === "all" ? undefined : value,
									})
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{SENTIMENTS.map((sentiment) => (
										<SelectItem key={sentiment.value} value={sentiment.value}>
											{sentiment.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</TabsContent>

					<TabsContent value="advanced" className="space-y-4 mt-4">
						{/* Topic Selection */}
						{uniqueTopics.length > 0 && (
							<div className="space-y-2">
								<label className="text-sm font-medium flex items-center gap-2">
									<TagIcon className="w-4 h-4" />
									Topics
								</label>
								<div className="flex flex-wrap gap-2">
									<Button
										variant={!filters.topic ? "default" : "outline"}
										size="sm"
										onClick={() => updateFilters({ topic: undefined })}
									>
										All Topics
									</Button>
									{uniqueTopics.slice(0, 10).map((topic) => (
										<Button
											key={topic}
											variant={filters.topic === topic ? "default" : "outline"}
											size="sm"
											onClick={() => updateFilters({ topic })}
										>
											{topic}
										</Button>
									))}
									{uniqueTopics.length > 10 && (
										<Badge variant="secondary" className="text-xs">
											+{uniqueTopics.length - 10} more
										</Badge>
									)}
								</div>
							</div>
						)}
					</TabsContent>
				</Tabs>

				{/* Active Filters Display */}
				{hasActiveFilters && (
					<>
						<Separator />
						<div className="space-y-2">
							<label className="text-sm font-medium">Active Filters:</label>
							<div className="flex flex-wrap gap-2">
								{filters.days !== 30 && (
									<Badge
										variant="secondary"
										className="flex items-center gap-1"
									>
										<Calendar className="w-3 h-3" />
										{TIME_RANGES.find((r) => r.value === filters.days)?.label ||
											`${filters.days} days`}
										<Button
											variant="ghost"
											size="sm"
											onClick={() => updateFilters({ days: 30 })}
											className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
										>
											<X className="w-3 h-3" />
										</Button>
									</Badge>
								)}

								{filters.platform && filters.platform !== "all" && (
									<Badge
										variant="secondary"
										className="flex items-center gap-1"
									>
										<Globe className="w-3 h-3" />
										{PLATFORMS.find((p) => p.value === filters.platform)
											?.label || filters.platform}
										<Button
											variant="ghost"
											size="sm"
											onClick={() => updateFilters({ platform: "all" })}
											className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
										>
											<X className="w-3 h-3" />
										</Button>
									</Badge>
								)}

								{filters.sentiment && filters.sentiment !== "all" && (
									<Badge
										variant="secondary"
										className="flex items-center gap-1"
									>
										<MessageSquare className="w-3 h-3" />
										{SENTIMENTS.find((s) => s.value === filters.sentiment)
											?.label || filters.sentiment}
										<Button
											variant="ghost"
											size="sm"
											onClick={() => updateFilters({ sentiment: "all" })}
											className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
										>
											<X className="w-3 h-3" />
										</Button>
									</Badge>
								)}

								{filters.topic && (
									<Badge
										variant="secondary"
										className="flex items-center gap-1"
									>
										<TagIcon className="w-3 h-3" />
										{filters.topic}
										<Button
											variant="ghost"
											size="sm"
											onClick={() => updateFilters({ topic: undefined })}
											className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
										>
											<X className="w-3 h-3" />
										</Button>
									</Badge>
								)}
							</div>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}

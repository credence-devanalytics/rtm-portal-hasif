"use client";

import { useState, useMemo } from "react";
import { MentionsFilterBar } from "@/components/ai/MentionsFilterBar";
import { MentionsGrid } from "@/components/ai/MentionsGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, MessageSquare, Heart, Eye, Sparkles } from "lucide-react";
import { usePublicMentions, useRecommendations } from "@/hooks/useQueries";

// Helper function to format large numbers
function formatNumber(num?: number) {
	if (!num || num === 0) return "0";
	if (num >= 1000000) {
		return (num / 1000000).toFixed(1) + "M";
	}
	if (num >= 1000) {
		return (num / 1000).toFixed(1) + "K";
	}
	return num.toLocaleString();
}

export default function RecommendationPage() {
	// State for filters
	const [filters, setFilters] = useState({
		days: 30,
		platform: undefined,
		sentiment: undefined,
		topic: undefined,
	});

	// Memoize filter updates to prevent unnecessary re-renders
	const handleFiltersChange = useMemo(
		() => (newFilters: typeof filters) => {
			setFilters((prev) => ({ ...prev, ...newFilters }));
		},
		[]
	);

	// Clean the filters for API calls
	const cleanFilters = {
		days: filters.days,
		platform:
			filters.platform && filters.platform !== "all"
				? filters.platform
				: undefined,
		sentiment:
			filters.sentiment && filters.sentiment !== "all"
				? filters.sentiment
				: undefined,
		topic:
			filters.topic && filters.topic !== "all" && filters.topic !== "undefined"
				? filters.topic
				: undefined,
	};

	// Fetch metrics data
	const {
		data: metricsData,
		isLoading: metricsLoading,
		error,
		isError,
	} = usePublicMentions(cleanFilters);

	// Fetch AI recommendations data
	const {
		data: recommendationsData,
		isLoading: recommendationsLoading,
		error: recommendationsError,
		isError: recommendationsIsError,
	} = useRecommendations();

	// Debug logging
	console.log("=== Frontend Debug ===");
	console.log("Filters:", filters);
	console.log("Clean filters:", cleanFilters);
	console.log("Clean filters truthy:", !!cleanFilters);
	console.log("Metrics data:", metricsData);
	console.log("Metrics loading:", metricsLoading);
	console.log("Metrics error:", error);
	console.log("Metrics is error:", isError);
	console.log("Recommendations data:", recommendationsData);
	console.log("Recommendations loading:", recommendationsLoading);
	console.log("Recommendations error:", recommendationsError);
	console.log("Recommendations is error:", recommendationsIsError);
	console.log("=====================");

	return (
		<div className="pt-18 px-4 max-w-7xl mx-auto">
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* Sidebar - Filters */}
				<div className="lg:col-span-1">
					<MentionsFilterBar
						filters={filters}
						onFiltersChange={handleFiltersChange}
						className="sticky top-18"
					/>
				</div>

				{/* Main Content */}
				<div className="lg:col-span-3">
					{/* Summary Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Mentions
								</CardTitle>
								<MessageSquare className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent className="">
								{metricsLoading ? (
									<Skeleton className="h-8 w-20 mb-2" />
								) : (
									<div className="text-2xl font-bold mb-2">
										{metricsData?.metrics?.totalMentions?.toLocaleString() || 0}
									</div>
								)}
								<p className="text-xs text-muted-foreground">
									In selected time range
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Reach
								</CardTitle>
								<Eye className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent className="">
								{metricsLoading ? (
									<Skeleton className="h-8 w-20 mb-2" />
								) : (
									<div className="text-2xl font-bold mb-2">
										{formatNumber(metricsData?.metrics?.totalReach) || 0}
									</div>
								)}
								<p className="text-xs text-muted-foreground">
									Potential audience
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Engagement
								</CardTitle>
								<Heart className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent className="">
								{metricsLoading ? (
									<Skeleton className="h-8 w-20 mb-2" />
								) : (
									<div className="text-2xl font-bold mb-2">
										{formatNumber(metricsData?.metrics?.totalInteractions) || 0}
									</div>
								)}
								<p className="text-xs text-muted-foreground">
									Total interactions
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Avg. Engagement
								</CardTitle>
								<TrendingUp className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent className="">
								{metricsLoading ? (
									<Skeleton className="h-8 w-16 mb-2" />
								) : (
									<div className="text-2xl font-bold mb-2">
										{((metricsData?.metrics?.avgEngagement || 0) * 100).toFixed(
											1
										)}
										%
									</div>
								)}
								<p className="text-xs text-muted-foreground">Engagement rate</p>
							</CardContent>
						</Card>
					</div>

					{/* View Tabs */}
					<Tabs defaultValue="mentions" className="w-full">
						<div className="flex items-center justify-between mb-4">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger
									value="mentions"
									className="flex items-center gap-2"
								>
									<MessageSquare className="w-4 h-4" />
									Mentions
								</TabsTrigger>
								<TabsTrigger
									value="analytics"
									className="flex items-center gap-2"
								>
									<Sparkles className="w-4 h-4" />
									AI Recommendations
								</TabsTrigger>
							</TabsList>

							<div className="flex items-center gap-2">
								{filters.platform && (
									<Badge variant="outline" className="text-xs">
										Platform: {filters.platform}
									</Badge>
								)}
								{filters.sentiment && (
									<Badge variant="outline" className="text-xs">
										Sentiment: {filters.sentiment}
									</Badge>
								)}
								{filters.topic && (
									<Badge variant="outline" className="text-xs">
										Topic: {filters.topic}
									</Badge>
								)}
							</div>
						</div>

						<TabsContent value="mentions" className="mt-0">
							<MentionsGrid filters={filters} />
						</TabsContent>

						<TabsContent value="analytics" className="mt-0">
							<div className="space-y-6">
								{/* Summary Section */}
								<Card>
									<CardHeader>
										<CardTitle>Summary</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											<p className="text-sm text-muted-foreground">
												Overall performance analysis and key highlights from
												your mentions data.
											</p>
											{metricsLoading ? (
												<Skeleton className="h-20 w-full" />
											) : (
												<div className="space-y-4">
													{recommendationsLoading ? (
														<Skeleton className="h-32 w-full" />
													) : recommendationsError ? (
														<div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
															<p className="text-sm text-red-600 dark:text-red-400">
																Failed to load AI recommendations. Please try again.
															</p>
														</div>
													) : recommendationsData?.summary ? (
														<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
															<div className="p-4 bg-muted/50 rounded-lg">
																<h4 className="font-medium mb-2">
																	Performance Overview
																</h4>
																<p className="text-sm text-muted-foreground whitespace-pre-wrap">
																	{recommendationsData.summary.performanceOverview}
																</p>
																<div className="mt-3 pt-3 border-t border-border">
																	<p className="text-xs text-muted-foreground">
																		Total mentions:{" "}
																		{metricsData?.metrics?.totalMentions?.toLocaleString() ||
																			0}
																	</p>
																	<p className="text-xs text-muted-foreground">
																		Reach:{" "}
																		{formatNumber(metricsData?.metrics?.totalReach)}
																	</p>
																</div>
															</div>
															<div className="p-4 bg-muted/50 rounded-lg">
																<h4 className="font-medium mb-2">Key Trends</h4>
																<p className="text-sm text-muted-foreground whitespace-pre-wrap">
																	{recommendationsData.summary.keyTrends}
																</p>
																<div className="mt-3 pt-3 border-t border-border">
																	<p className="text-xs text-muted-foreground">
																		Time period: Last {filters.days} days
																	</p>
																	<p className="text-xs text-muted-foreground">
																		Generated: {recommendationsData.meta?.generatedAt ?
																			new Date(recommendationsData.meta.generatedAt).toLocaleDateString() :
																			'Unknown'
																		}
																	</p>
																</div>
															</div>
														</div>
													) : (
														<div className="p-4 bg-muted/50 rounded-lg">
															<p className="text-sm text-muted-foreground">
																No recommendations data available. Click the AI Recommendations tab to generate insights.
															</p>
														</div>
													)}
												</div>
											)}
										</div>
									</CardContent>
								</Card>

								{/* Sentiment Section */}
								<Card>
									<CardHeader>
										<CardTitle>Sentiment Analysis</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											<p className="text-sm text-muted-foreground">
												Understanding the emotional tone and sentiment
												distribution across your mentions.
											</p>
											{recommendationsLoading ? (
												<Skeleton className="h-32 w-full" />
											) : recommendationsError ? (
												<div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
													<p className="text-sm text-red-600 dark:text-red-400">
														Failed to load sentiment analysis. Please try again.
													</p>
												</div>
											) : recommendationsData?.sentiment ? (
												<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
													<div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
														<h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
															Positive
														</h4>
														<p className="text-2xl font-bold text-green-600 dark:text-green-400">
															{recommendationsData.sentiment.positive.toLocaleString()}
														</p>
														<p className="text-sm text-green-600 dark:text-green-400">
															Favorable mentions and engagement
														</p>
														<div className="mt-2">
															<div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
																<div
																	className="bg-green-500 h-2 rounded-full"
																	style={{
																		width: `${recommendationsData.sentiment.positive > 0 ?
																			(recommendationsData.sentiment.positive /
																				(recommendationsData.sentiment.positive + recommendationsData.sentiment.neutral + recommendationsData.sentiment.negative)) * 100 : 0}%`
																	}}
																></div>
															</div>
														</div>
													</div>
													<div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
														<h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
															Neutral
														</h4>
														<p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
															{recommendationsData.sentiment.neutral.toLocaleString()}
														</p>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															Balanced and objective mentions
														</p>
														<div className="mt-2">
															<div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
																<div
																	className="bg-gray-500 h-2 rounded-full"
																	style={{
																		width: `${recommendationsData.sentiment.neutral > 0 ?
																			(recommendationsData.sentiment.neutral /
																				(recommendationsData.sentiment.positive + recommendationsData.sentiment.neutral + recommendationsData.sentiment.negative)) * 100 : 0}%`
																	}}
																></div>
															</div>
														</div>
													</div>
													<div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
														<h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
															Negative
														</h4>
														<p className="text-2xl font-bold text-red-600 dark:text-red-400">
															{recommendationsData.sentiment.negative.toLocaleString()}
														</p>
														<p className="text-sm text-red-600 dark:text-red-400">
															Critical or unfavorable mentions
														</p>
														<div className="mt-2">
															<div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-2">
																<div
																	className="bg-red-500 h-2 rounded-full"
																	style={{
																		width: `${recommendationsData.sentiment.negative > 0 ?
																			(recommendationsData.sentiment.negative /
																				(recommendationsData.sentiment.positive + recommendationsData.sentiment.neutral + recommendationsData.sentiment.negative)) * 100 : 0}%`
																	}}
																></div>
															</div>
														</div>
													</div>
												</div>
											) : (
												<div className="p-4 bg-muted/50 rounded-lg">
													<p className="text-sm text-muted-foreground">
														No sentiment data available. Click the AI Recommendations tab to analyze sentiment distribution.
													</p>
												</div>
											)}
										</div>
									</CardContent>
								</Card>

								{/* Tone of Voice Section */}
								<Card>
									<CardHeader>
										<CardTitle>Tone of Voice Analysis</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											<p className="text-sm text-muted-foreground">
												Analysis of communication patterns and brand voice
												consistency across different platforms.
											</p>
											{recommendationsLoading ? (
												<Skeleton className="h-32 w-full" />
											) : recommendationsError ? (
												<div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
													<p className="text-sm text-red-600 dark:text-red-400">
														Failed to load tone of voice analysis. Please try again.
													</p>
												</div>
											) : recommendationsData?.toneOfVoice ? (
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div className="p-4 bg-muted/50 rounded-lg">
														<h4 className="font-medium mb-2">
															Communication Style
														</h4>
														<p className="text-sm text-muted-foreground whitespace-pre-wrap">
															{recommendationsData.toneOfVoice.communicationStyle}
														</p>
													</div>
													<div className="p-4 bg-muted/50 rounded-lg">
														<h4 className="font-medium mb-2">
															Platform Adaptation
														</h4>
														<p className="text-sm text-muted-foreground whitespace-pre-wrap">
															{recommendationsData.toneOfVoice.platformAdaptation}
														</p>
													</div>
												</div>
											) : (
												<div className="p-4 bg-muted/50 rounded-lg">
													<p className="text-sm text-muted-foreground">
														No tone of voice analysis available. Click the AI Recommendations tab to analyze communication patterns.
													</p>
												</div>
											)}
										</div>
									</CardContent>
								</Card>

								{/* Key Insights Section */}
								<Card>
									<CardHeader>
										<CardTitle>Key Insights</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											<p className="text-sm text-muted-foreground">
												Actionable insights and recommendations based on your
												mentions data analysis.
											</p>
											{recommendationsLoading ? (
												<Skeleton className="h-40 w-full" />
											) : recommendationsError ? (
												<div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
													<p className="text-sm text-red-600 dark:text-red-400">
														Failed to load key insights. Please try again.
													</p>
												</div>
											) : recommendationsData?.keyInsights ? (
												<div className="space-y-4">
													<div className="p-4 bg-muted/50 rounded-lg">
														<h4 className="font-medium mb-2">
															📊 Performance Highlights
														</h4>
														<p className="text-sm text-muted-foreground whitespace-pre-wrap">
															{recommendationsData.keyInsights.performanceHighlights}
														</p>
													</div>
													<div className="p-4 bg-muted/50 rounded-lg">
														<h4 className="font-medium mb-2">
															🎯 Strategic Recommendations
														</h4>
														<p className="text-sm text-muted-foreground whitespace-pre-wrap">
															{recommendationsData.keyInsights.strategicRecommendations}
														</p>
													</div>
													<div className="p-4 bg-muted/50 rounded-lg">
														<h4 className="font-medium mb-2">
															🚀 Growth Opportunities
														</h4>
														<p className="text-sm text-muted-foreground whitespace-pre-wrap">
															{recommendationsData.keyInsights.growthOpportunities}
														</p>
													</div>
													{recommendationsData?.meta && (
														<div className="p-4 bg-muted/30 rounded-lg border">
															<p className="text-xs text-muted-foreground">
																Analysis based on {recommendationsData.meta.totalMentionsAnalyzed} mentions from {recommendationsData.meta.dataSource === 'database' ? 'live database' : 'sample data'}
															</p>
														</div>
													)}
												</div>
											) : (
												<div className="p-4 bg-muted/50 rounded-lg">
													<p className="text-sm text-muted-foreground">
														No insights available. Click the AI Recommendations tab to generate actionable insights based on your mentions data.
													</p>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}

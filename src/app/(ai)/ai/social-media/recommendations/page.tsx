"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { useRecommendations } from "@/hooks/useQueries";

export default function RecommendationPage() {
	// Fetch AI recommendations data
	const {
		data: recommendationsData,
		isLoading: recommendationsLoading,
		error: recommendationsError,
		isError: recommendationsIsError,
	} = useRecommendations();

	return (
		<div className="pt-2 px-4 max-w-7xl mx-auto">
			<div className="mb-6">
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<Sparkles className="w-6 h-6" />
					AI Recommendations
				</h1>
			</div>

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
							<div className="space-y-4">
								{recommendationsLoading ? (
									<Skeleton className="h-32 w-full" />
								) : recommendationsError ? (
									<div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
										<p className="text-sm text-red-600 dark:text-red-400">
											Failed to load AI recommendations. Please try
											again.
										</p>
									</div>
								) : recommendationsData?.summary ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="p-4 bg-muted/50 rounded-lg">
											<h4 className="font-medium mb-2">
												Performance Overview
											</h4>
											<p className="text-sm text-muted-foreground whitespace-pre-wrap">
												{
													recommendationsData.summary
														.performanceOverview
												}
											</p>
										</div>
										<div className="p-4 bg-muted/50 rounded-lg">
											<h4 className="font-medium mb-2">Key Trends</h4>
											<p className="text-sm text-muted-foreground whitespace-pre-wrap">
												{recommendationsData.summary.keyTrends}
											</p>
											<div className="mt-3 pt-3 border-t border-border">
												<p className="text-xs text-muted-foreground">
													Generated:{" "}
													{recommendationsData.meta?.generatedAt
														? new Date(
																recommendationsData.meta.generatedAt
														  ).toLocaleDateString()
														: "Unknown"}
												</p>
											</div>
										</div>
									</div>
								) : (
									<div className="p-4 bg-muted/50 rounded-lg">
										<p className="text-sm text-muted-foreground">
											No recommendations data available. Generate insights to see AI recommendations.
										</p>
									</div>
								)}
							</div>
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
														width: `${
															recommendationsData.sentiment.positive > 0
																? (recommendationsData.sentiment
																		.positive /
																		(recommendationsData.sentiment
																			.positive +
																			recommendationsData.sentiment
																				.neutral +
																			recommendationsData.sentiment
																				.negative)) *
																  100
																: 0
														}%`,
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
														width: `${
															recommendationsData.sentiment.neutral > 0
																? (recommendationsData.sentiment
																		.neutral /
																		(recommendationsData.sentiment
																			.positive +
																			recommendationsData.sentiment
																				.neutral +
																			recommendationsData.sentiment
																				.negative)) *
																  100
																: 0
														}%`,
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
														width: `${
															recommendationsData.sentiment.negative > 0
																? (recommendationsData.sentiment
																		.negative /
																		(recommendationsData.sentiment
																			.positive +
																			recommendationsData.sentiment
																				.neutral +
																			recommendationsData.sentiment
																				.negative)) *
																  100
																: 0
														}%`,
													}}
												></div>
											</div>
										</div>
									</div>
								</div>
							) : (
								<div className="p-4 bg-muted/50 rounded-lg">
									<p className="text-sm text-muted-foreground">
										No sentiment data available. Generate insights to analyze sentiment
										distribution.
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
										Failed to load tone of voice analysis. Please try
										again.
									</p>
								</div>
							) : recommendationsData?.toneOfVoice ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="p-4 bg-muted/50 rounded-lg">
										<h4 className="font-medium mb-2">
											Communication Style
										</h4>
										<p className="text-sm text-muted-foreground whitespace-pre-wrap">
											{
												recommendationsData.toneOfVoice
													.communicationStyle
											}
										</p>
									</div>
									<div className="p-4 bg-muted/50 rounded-lg">
										<h4 className="font-medium mb-2">
											Platform Adaptation
										</h4>
										<p className="text-sm text-muted-foreground whitespace-pre-wrap">
											{
												recommendationsData.toneOfVoice
													.platformAdaptation
											}
										</p>
									</div>
								</div>
							) : (
								<div className="p-4 bg-muted/50 rounded-lg">
									<p className="text-sm text-muted-foreground">
										No tone of voice analysis available. Generate insights to analyze communication
										patterns.
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
											{
												recommendationsData.keyInsights
													.performanceHighlights
											}
										</p>
									</div>
									<div className="p-4 bg-muted/50 rounded-lg">
										<h4 className="font-medium mb-2">
											🎯 Strategic Recommendations
										</h4>
										<p className="text-sm text-muted-foreground whitespace-pre-wrap">
											{
												recommendationsData.keyInsights
													.strategicRecommendations
											}
										</p>
									</div>
									<div className="p-4 bg-muted/50 rounded-lg">
										<h4 className="font-medium mb-2">
											🚀 Growth Opportunities
										</h4>
										<p className="text-sm text-muted-foreground whitespace-pre-wrap">
											{
												recommendationsData.keyInsights
													.growthOpportunities
											}
										</p>
									</div>
									{recommendationsData?.meta && (
										<div className="p-4 bg-muted/30 rounded-lg border">
											<p className="text-xs text-muted-foreground">
												Analysis based on{" "}
												{recommendationsData.meta.totalMentionsAnalyzed}{" "}
												mentions from{" "}
												{recommendationsData.meta.dataSource ===
												"database"
													? "live database"
													: "sample data"}
											</p>
										</div>
									)}
								</div>
							) : (
								<div className="p-4 bg-muted/50 rounded-lg">
									<p className="text-sm text-muted-foreground">
										No insights available. Generate insights to see AI recommendations based on your
										mentions data.
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
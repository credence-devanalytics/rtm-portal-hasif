"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { useRecommendations } from "@/hooks/useQueries";
import { LanguageToggle, Language } from "@/components/language-toggle";
import { useRecommendationsTranslation } from "@/lib/translations/recommendations";

export default function RecommendationPage() {
	// Language state management
	const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
		if (typeof window !== "undefined") {
			const savedLanguage = localStorage.getItem("rtm-language") as Language;
			return savedLanguage || "en";
		}
		return "en";
	});

	// Save language preference to localStorage
	const handleLanguageChange = (language: Language) => {
		setCurrentLanguage(language);
		if (typeof window !== "undefined") {
			localStorage.setItem("rtm-language", language);
		}
	};

	// Load language preference on mount
	useEffect(() => {
		if (typeof window !== "undefined") {
			const savedLanguage = localStorage.getItem("rtm-language") as Language;
			if (savedLanguage && savedLanguage !== currentLanguage) {
				setCurrentLanguage(savedLanguage);
			}
		}
	}, []);

	// Get translations for current language
	const t = useRecommendationsTranslation(currentLanguage);

	// Fetch AI recommendations data with language parameter
	const {
		data: recommendationsData,
		isLoading: recommendationsLoading,
		error: recommendationsError,
		isError: recommendationsIsError,
	} = useRecommendations(currentLanguage);

	return (
		<div className="pt-2 px-4 max-w-7xl mx-auto">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<Sparkles className="w-6 h-6" />
					{t.title}
				</h1>
				<LanguageToggle
					currentLanguage={currentLanguage}
					onLanguageChange={handleLanguageChange}
				/>
			</div>

			<div className="space-y-6">
				{/* Summary Section */}
				<Card>
					<CardHeader>
						<CardTitle>{t.summaryTitle}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">
								{t.summaryDescription}
							</p>
							<div className="space-y-4">
								{recommendationsLoading ? (
									<Skeleton className="h-32 w-full" />
								) : recommendationsError ? (
									<div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
										<p className="text-sm text-red-600 dark:text-red-400">
											{t.failedToLoad} {t.aiRecommendations}
										</p>
									</div>
								) : recommendationsData?.summary ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="p-4 bg-muted/50 rounded-lg">
											<h4 className="font-medium mb-2">
												{t.performanceOverview}
											</h4>
											<p className="text-sm text-muted-foreground whitespace-pre-wrap">
												{
													recommendationsData.summary
														.performanceOverview
												}
											</p>
										</div>
										<div className="p-4 bg-muted/50 rounded-lg">
											<h4 className="font-medium mb-2">{t.keyTrends}</h4>
											<p className="text-sm text-muted-foreground whitespace-pre-wrap">
												{recommendationsData.summary.keyTrends}
											</p>
											<div className="mt-3 pt-3 border-t border-border">
												<p className="text-xs text-muted-foreground">
													{t.generated}:{" "}
													{recommendationsData.meta?.generatedAt
														? new Date(
																recommendationsData.meta.generatedAt
														  ).toLocaleDateString()
														: t.unknown}
												</p>
											</div>
										</div>
									</div>
								) : (
									<div className="p-4 bg-muted/50 rounded-lg">
										<p className="text-sm text-muted-foreground">
											{t.noDataSummary}
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
						<CardTitle>{t.sentimentTitle}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">
								{t.sentimentDescription}
							</p>
							{recommendationsLoading ? (
								<Skeleton className="h-32 w-full" />
							) : recommendationsError ? (
								<div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
									<p className="text-sm text-red-600 dark:text-red-400">
										{t.failedToLoad} {t.sentimentAnalysis}
									</p>
								</div>
							) : recommendationsData?.sentiment ? (
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
										<h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
											{t.positive}
										</h4>
										<p className="text-2xl font-bold text-green-600 dark:text-green-400">
											{recommendationsData.sentiment.positive.toLocaleString()}
										</p>
										<p className="text-sm text-green-600 dark:text-green-400">
											{t.favorableMentions}
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
											{t.neutral}
										</h4>
										<p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
											{recommendationsData.sentiment.neutral.toLocaleString()}
										</p>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											{t.balancedMentions}
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
											{t.negative}
										</h4>
										<p className="text-2xl font-bold text-red-600 dark:text-red-400">
											{recommendationsData.sentiment.negative.toLocaleString()}
										</p>
										<p className="text-sm text-red-600 dark:text-red-400">
											{t.criticalMentions}
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
										{t.noDataSentiment}
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Tone of Voice Section */}
				<Card>
					<CardHeader>
						<CardTitle>{t.toneTitle}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">
								{t.toneDescription}
							</p>
							{recommendationsLoading ? (
								<Skeleton className="h-32 w-full" />
							) : recommendationsError ? (
								<div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
									<p className="text-sm text-red-600 dark:text-red-400">
										{t.failedToLoad} {t.toneAnalysis}
									</p>
								</div>
							) : recommendationsData?.toneOfVoice ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="p-4 bg-muted/50 rounded-lg">
										<h4 className="font-medium mb-2">
											{t.communicationStyle}
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
											{t.platformAdaptation}
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
										{t.noDataTone}
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Key Insights Section */}
				<Card>
					<CardHeader>
						<CardTitle>{t.insightsTitle}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">
								{t.insightsDescription}
							</p>
							{recommendationsLoading ? (
								<Skeleton className="h-40 w-full" />
							) : recommendationsError ? (
								<div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
									<p className="text-sm text-red-600 dark:text-red-400">
										{t.failedToLoad} {t.keyInsightsError}
									</p>
								</div>
							) : recommendationsData?.keyInsights ? (
								<div className="space-y-4">
									<div className="p-4 bg-muted/50 rounded-lg">
										<h4 className="font-medium mb-2">
											{t.performanceHighlights}
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
											{t.strategicRecommendations}
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
											{t.growthOpportunities}
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
												{t.analysisBasedOn}{" "}
												{recommendationsData.meta.totalMentionsAnalyzed}{" "}
												{t.mentionsFrom}{" "}
												{recommendationsData.meta.dataSource ===
												"database"
													? t.liveDatabase
													: t.sampleData}
											</p>
										</div>
									)}
								</div>
							) : (
								<div className="p-4 bg-muted/50 rounded-lg">
									<p className="text-sm text-muted-foreground">
										{t.noDataInsights}
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
import { Language } from "@/components/language-toggle";

export const recommendationsTranslations = {
  en: {
    // Page header
    title: "AI Recommendations",

    // Summary section
    summaryTitle: "Summary",
    summaryDescription: "Overall performance analysis and key highlights from your mentions data.",
    performanceOverview: "Performance Overview",
    keyTrends: "Key Trends",
    generated: "Generated",
    unknown: "Unknown",
    noDataSummary: "No recommendations data available. Generate insights to see AI recommendations.",

    // Sentiment Analysis section
    sentimentTitle: "Sentiment Analysis",
    sentimentDescription: "Understanding the emotional tone and sentiment distribution across your mentions.",
    positive: "Positive",
    neutral: "Neutral",
    negative: "Negative",
    favorableMentions: "Favorable mentions and engagement",
    balancedMentions: "Balanced and objective mentions",
    criticalMentions: "Critical or unfavorable mentions",
    noDataSentiment: "No sentiment data available. Generate insights to analyze sentiment distribution.",

    // Tone of Voice section
    toneTitle: "Tone of Voice Analysis",
    toneDescription: "Analysis of communication patterns and brand voice consistency across different platforms.",
    communicationStyle: "Communication Style",
    platformAdaptation: "Platform Adaptation",
    noDataTone: "No tone of voice analysis available. Generate insights to analyze communication patterns.",

    // Key Insights section
    insightsTitle: "Key Insights",
    insightsDescription: "Actionable insights and recommendations based on your mentions data analysis.",
    performanceHighlights: "📊 Performance Highlights",
    strategicRecommendations: "🎯 Strategic Recommendations",
    growthOpportunities: "🚀 Growth Opportunities",
    analysisBasedOn: "Analysis based on",
    mentionsFrom: "mentions from",
    liveDatabase: "live database",
    sampleData: "sample data",
    noDataInsights: "No insights available. Generate insights to see AI recommendations based on your mentions data.",

    // Error messages
    failedToLoad: "Failed to load",
    aiRecommendations: "AI recommendations. Please try again.",
    sentimentAnalysis: "sentiment analysis. Please try again.",
    toneAnalysis: "tone of voice analysis. Please try again.",
    keyInsightsError: "key insights. Please try again.",

    // Language
    selectLanguage: "Select language",
    english: "English",
    malay: "Bahasa Melayu",
  },

  bm: {
    // Page header
    title: "Cadangan AI",

    // Summary section
    summaryTitle: "Ringkasan",
    summaryDescription: "Analisis prestasi keseluruhan dan sorotan utama daripada data sebutan anda.",
    performanceOverview: "Gambaran Prestasi",
    keyTrends: "Trend Utama",
    generated: "Dijanakan",
    unknown: "Tidak diketahui",
    noDataSummary: "Tiada data cadangan tersedia. Janakan pandangan untuk melihat cadangan AI.",

    // Sentiment Analysis section
    sentimentTitle: "Analisis Sentimen",
    sentimentDescription: "Memahami nada emosi dan taburan sentimen merentas sebutan anda.",
    positive: "Positif",
    neutral: "Neutral",
    negative: "Negatif",
    favorableMentions: "Sebutan dan keterlibatan yang memberangsangkan",
    balancedMentions: "Sebutan yang seimbang dan objektif",
    criticalMentions: "Sebutan yang kritikal atau tidak memberangsangkan",
    noDataSentiment: "Tiada data sentimen tersedia. Janakan pandangan untuk menganalisis taburan sentimen.",

    // Tone of Voice section
    toneTitle: "Analisis Nada Suara",
    toneDescription: "Analisis corak komunikasi dan konsistensi suara jenama merentas platform yang berbeza.",
    communicationStyle: "Gaya Komunikasi",
    platformAdaptation: "Penyesuaian Platform",
    noDataTone: "Tiada analisis nada suara tersedia. Janakan pandangan untuk menganalisis corak komunikasi.",

    // Key Insights section
    insightsTitle: "Pandangan Utama",
    insightsDescription: "Pandangan dan cadangan yang boleh dilaksanakan berdasarkan analisis data sebutan anda.",
    performanceHighlights: "📊 Sorotan Prestasi",
    strategicRecommendations: "🎯 Cadangan Strategik",
    growthOpportunities: "🚀 Peluang Pertumbuhan",
    analysisBasedOn: "Analisis berdasarkan",
    mentionsFrom: "sebutan daripada",
    liveDatabase: "pangkalan data langsung",
    sampleData: "data sampel",
    noDataInsights: "Tiada pandangan tersedia. Janakan pandangan untuk melihat cadangan AI berdasarkan data sebutan anda.",

    // Error messages
    failedToLoad: "Gagal memuatkan",
    aiRecommendations: "cadangan AI. Sila cuba lagi.",
    sentimentAnalysis: "analisis sentimen. Sila cuba lagi.",
    toneAnalysis: "analisis nada suara. Sila cuba lagi.",
    keyInsightsError: "pandangan utama. Sila cuba lagi.",

    // Language
    selectLanguage: "Pilih bahasa",
    english: "English",
    malay: "Bahasa Melayu",
  },
} as const;

export type RecommendationsTranslations = typeof recommendationsTranslations.en | typeof recommendationsTranslations.bm;

export const useRecommendationsTranslation = (language: Language): RecommendationsTranslations => {
  return recommendationsTranslations[language];
};
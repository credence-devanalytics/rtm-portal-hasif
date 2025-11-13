import { generateObject } from "ai";
import { createAzure } from "@ai-sdk/azure";
import { z } from "zod";
import { db } from "@/index";
import { mentionsClassifyPublic } from "@/lib/schema";
import { desc, gte, and, sql, count } from "drizzle-orm";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const azure = createAzure({
	resourceName: process.env.AZURE_RESOURCE_NAME,
	apiKey: process.env.AZURE_API_KEY,
});

// Schema for AI-generated recommendations
const recommendationsSchema = z.object({
	summary: z.object({
		performanceOverview: z
			.string()
			.describe("Overview of performance metrics and highlights"),
		keyTrends: z
			.string()
			.describe("Important trends and patterns observed in the data"),
	}),
	toneOfVoice: z.object({
		communicationStyle: z
			.string()
			.describe("Analysis of communication patterns and language used"),
		platformAdaptation: z
			.string()
			.describe("How communication varies across different platforms"),
	}),
	keyInsights: z.object({
		performanceHighlights: z
			.string()
			.describe("Key performance achievements and notable metrics"),
		strategicRecommendations: z
			.string()
			.describe("Actionable recommendations for improvement"),
		growthOpportunities: z
			.string()
			.describe("Potential areas for growth and expansion"),
	}),
});

export async function POST(request: Request) {
	try {
		const body = await request.json().catch(() => ({}));
		const language = body.language || 'en'; // Default to English if not provided

		console.log("🚀 AI Recommendations API: Starting analysis...", { language });

		// Get current date and calculate 7-day range
		const currentDate = new Date();
		const sevenDaysAgo = new Date(currentDate);
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		console.log("📅 Date range:", {
			current: currentDate.toISOString(),
			sevenDaysAgo: sevenDaysAgo.toISOString(),
		});

		// Get mentionsPublicClassify for the time range with highest engagement rate (top 100)
		let topMentions = [];
		let sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
		let usingLocalData = false;

		try {
			console.log("🔍 Fetching top mentions by engagement rate...");

			// Query for mentions with highest engagement rate in the 7-day period
			topMentions = await db
				.select({
					mention: mentionsClassifyPublic.mention,
					sentiment: mentionsClassifyPublic.sentiment,
					engagementrate: mentionsClassifyPublic.engagementrate,
					author: mentionsClassifyPublic.author,
					type: mentionsClassifyPublic.type,
					inserttime: mentionsClassifyPublic.inserttime,
				})
				.from(mentionsClassifyPublic)
				.where(
					and(
						gte(mentionsClassifyPublic.inserttime, sevenDaysAgo.toISOString()),
						sql`${mentionsClassifyPublic.engagementrate} > 0`
					)
				)
				.orderBy(desc(mentionsClassifyPublic.engagementrate))
				.limit(100);

			console.log(
				`✅ Found ${topMentions.length} mentions with engagement data`
			);

			// Count sentiment distribution
			const sentimentQuery = await db
				.select({
					sentiment: mentionsClassifyPublic.sentiment,
					count: count(),
				})
				.from(mentionsClassifyPublic)
				.where(
					and(
						gte(mentionsClassifyPublic.inserttime, sevenDaysAgo.toISOString()),
						sql`${mentionsClassifyPublic.engagementrate} > 0`
					)
				)
				.groupBy(mentionsClassifyPublic.sentiment);

			// Aggregate sentiment counts
			sentimentQuery.forEach((item) => {
				const sentiment = item.sentiment?.toLowerCase();
				if (sentiment === "positive") sentimentCounts.positive = item.count;
				else if (sentiment === "neutral") sentimentCounts.neutral = item.count;
				else if (sentiment === "negative")
					sentimentCounts.negative = item.count;
			});

			console.log("📊 Sentiment distribution:", sentimentCounts);
		} catch (dbError) {
			console.log(
				"❌ Database query failed, using fallback data:",
				dbError.message
			);
			usingLocalData = true;

			// Fallback: use sample data when database is unavailable
			topMentions = [
				{
					mention: "Great product quality and excellent customer service!",
					sentiment: "positive",
					engagementrate: 8.5,
					author: "Customer",
					type: "Twitter",
					inserttime: new Date().toISOString(),
				},
				{
					mention: "Could improve delivery times and packaging quality",
					sentiment: "negative",
					engagementrate: 6.2,
					author: "User",
					type: "Facebook",
					inserttime: new Date().toISOString(),
				},
			];

			sentimentCounts = { positive: 45, neutral: 30, negative: 15 };
		}

		// Prepare mentions text for AI analysis
		const mentionsText = topMentions
			.slice(0, 50) // Use top 50 mentions for analysis
			.map((m) => m.mention)
			.join("\n\n");

		if (!mentionsText || mentionsText.trim().length === 0) {
			console.log("⚠️ No mention text available for AI analysis");
			return NextResponse.json(
				{
					error: "No data available for analysis",
					sentiment: sentimentCounts,
					usingLocalData,
				},
				{ status: 404 }
			);
		}

		console.log("🤖 Generating AI recommendations from mentions...");

		// Extract platform information for analysis
		const platformData = topMentions.reduce((acc, mention) => {
			const platform = mention.type || 'Unknown';
			if (!acc[platform]) {
				acc[platform] = {
					count: 0,
					mentions: [],
					sentiments: { positive: 0, neutral: 0, negative: 0 }
				};
			}
			acc[platform].count++;
			acc[platform].mentions.push(mention.mention);
			const sentiment = mention.sentiment?.toLowerCase();
			if (sentiment === 'positive') acc[platform].sentiments.positive++;
			else if (sentiment === 'neutral') acc[platform].sentiments.neutral++;
			else if (sentiment === 'negative') acc[platform].sentiments.negative++;
			return acc;
		}, {});

		const platformSummary = Object.entries(platformData)
			.map(([platform, data]) => `${platform}: ${data.count} mentions, avg sentiment: ${data.sentiments.positive > data.sentiments.negative ? 'positive' : data.sentiments.negative > data.sentiments.positive ? 'negative' : 'neutral'}`)
			.join('\n');

		// Generate AI recommendations using generateObject
		const languageInstruction = language === 'bm'
			? `Please provide all your responses in Bahasa Malaysia. Generate your analysis, insights, and recommendations entirely in Bahasa Malaysia.`
			: `Please provide all your responses in English. Generate your analysis, insights, and recommendations entirely in English.`;

		const contextInstruction = language === 'bm'
			? `Anda menganalisis sebutan media sosial untuk RTM (Radio Televisyen Malaysia), penyiar negara Malaysia. Pasukan media sosial menguruskan kandungan merentangi pelbagai platform dan memerlukan pandangan untuk meningkatkan strategi komunikasi penyiaran mereka.`
			: `You are analyzing social media mentions for RTM (Radio Televisyen Malaysia), Malaysia's national broadcaster. The social media team manages content across multiple platforms and needs insights to improve their broadcasting communication strategy.`;

		const analysisInstruction = language === 'bm'
			? `Berdasarkan sebutan ini, sila berikan:

1. Ringkasan sorotan prestasi dan trend utama untuk kehadiran media sosial RTM

2. Analisis nada suara yang terdapat dalam SEBUTAN SEBENAR tentang RTM:
   - Gaya Komunikasi: Analisis bagaimana orang bercakap tentang RTM - corak bahasa, perbendaharaan kata, dan pendekatan komunikasi mereka
   - Penyesuaian Platform: Bagaimana sebutan tentang RTM berbeza merentangi platform media sosial yang berbeza (mengambil kira preferensi audiens Malaysia)

3. Pandangan dan cadangan yang boleh ditindakkan khusus untuk pasukan media sosial RTM:
   - Peningkatan strategi kandungan untuk penglibatan audiens yang lebih baik
   - Pendekatan komunikasi yang beresonansi dengan audiens Malaysia
   - Strategi khusus platform untuk kandungan penyiaran RTM
   - Cara untuk meningkatkan persepsi awam dan penglibatan

Untuk analisis nada suara, fokus pada:
- Bagaimana rakyat Malaysia membincangkan kandungan dan program RTM
- Preferensi bahasa (Bahasa Malaysia, Bahasa Inggeris, pertukaran kod)
- Konteks budaya dalam cara orang merujuk RTM
- Tindak balas emosi terhadap kandungan penyiaran RTM
- Corak komunikasi khusus platform tentang RTM

Sediakan cadangan yang membantu RTM:
- Lebih baik menghubungkan dengan audiens Malaysia merentasi demografi yang berbeza
- Meningkatkan promosi kandungan dan kesedaran program
- Meningkatkan keberkesanan komunikasi perkhidmatan awam
- Menangani maklum balas dan sentimen audiens secara konstruktif
- Mengoptimumkan strategi media sosial untuk objektif penyiaran negara

Jadikan semua cadangan praktikal dan boleh ditindakkan untuk organisasi media kerajaan yang berkhidmat untuk orang ramai Malaysia.`
			: `Based on these mentions, please provide:

1. A summary of performance highlights and key trends for RTM's social media presence

2. Analysis of tone of voice found IN THE ACTUAL MENTIONS about RTM:
   - Communication Style: Analyze how people talk about RTM - their language patterns, vocabulary, and communication approaches
   - Platform Adaptation: How mentions about RTM vary across different social media platforms (considering Malaysian audience preferences)

3. Actionable insights and recommendations specifically for RTM's social media team:
   - Content strategy improvements for better audience engagement
   - Communication approaches that resonate with Malaysian audiences
   - Platform-specific strategies for RTM's broadcasting content
   - Ways to improve public perception and engagement

For tone of voice analysis, focus on:
- How Malaysians discuss RTM content and programs
- Language preferences (Bahasa Malaysia, English, code-switching)
- Cultural context in how people reference RTM
- Emotional responses to RTM's broadcasting content
- Platform-specific communication patterns about RTM

Provide recommendations that help RTM:
- Better connect with Malaysian audiences across different demographics
- Improve content promotion and program awareness
- Enhance public service communication effectiveness
- Address audience feedback and sentiment constructively
- Optimize social media strategy for national broadcasting objectives

Make all recommendations practical and actionable for a government media organization serving the Malaysian public.`;

		const { object: recommendations } = await generateObject({
			model: azure("gpt-4.1"),
			prompt: `${languageInstruction}

Analyze the following social media mentions about RTM (Radio Televisyen Malaysia) from the past 7 days and provide actionable insights for the RTM social media team:

MENTIONS:
${mentionsText}

PLATFORM ANALYSIS:
${platformSummary}

Context: ${contextInstruction}

${analysisInstruction}`,
			schema: recommendationsSchema,
		});

		console.log("✅ AI recommendations generated successfully");

		// Return the generated recommendations and sentiment data
		return NextResponse.json({
			summary: recommendations.summary,
			toneOfVoice: recommendations.toneOfVoice,
			keyInsights: recommendations.keyInsights,
			sentiment: sentimentCounts,
			meta: {
				generatedAt: new Date().toISOString(),
				dateRange: {
					start: sevenDaysAgo.toISOString(),
					end: currentDate.toISOString(),
				},
				totalMentionsAnalyzed: topMentions.length,
				dataSource: usingLocalData ? "fallback_sample" : "database",
			},
		});
	} catch (error) {
		console.error("❌ AI Recommendations API error:", error);
		return NextResponse.json(
			{
				error: "Failed to generate recommendations",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

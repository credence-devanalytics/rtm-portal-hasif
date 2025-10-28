import {
	streamText,
	UIMessage,
	convertToModelMessages,
	createUIMessageStream,
	createUIMessageStreamResponse,
	stepCountIs,
	tool,
	generateText,
} from "ai";
import { createAzure } from "@ai-sdk/azure";
import { string, z } from "zod";
import { nanoid } from "nanoid";
import {
	getLatestTopics,
	getHighInteractionMentions,
} from "@/lib/ai-tools/social-media/get-latest-topics";
import {
	createBraveSearchClient,
	BraveSearchOptions,
} from "@/lib/ai-tools/web-search/brave-search";
import { fetchPortalBeritaAudienceData } from "@/lib/ai-tools/audience-analysis/pberita-analysis";
import { fetchRTMKlikAudienceData } from "@/lib/ai-tools/audience-analysis/rtmklik-analysis";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const azure = createAzure({
	resourceName: process.env.AZURE_RESOURCE_NAME, // Azure resource name
	apiKey: process.env.AZURE_API_KEY,
});

// Zod enums for advertisement analysis
const genderEnum = z.enum(["male", "female", "all"]);
const ageRangeEnum = z.enum(["18-24", "25-34", "35-44", "45-54", "55-64", "all"]);
const dayFilterEnum = z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "weekdays", "weekends", "all"]);

// Types
export type MarketingMessage = UIMessage<
	never, // metadata type
	{
		latestTopic:
			| { status: "searching" }
			| { status: "found"; topicSummary: string };
		cardUI:
			| { status: "loading" }
			| { status: "finish"; title: string; contents: string; type: string };
		advertisementAnalysis:
			| { status: "loading" }
			| { status: "complete"; analysis: any };
	} // data parts type,
>;

export async function POST(req: Request) {
	const {
		messages,
	}: {
		messages: UIMessage[];
	} = await req.json();

	// Implement Data Stream
	const stream = createUIMessageStream<MarketingMessage>({
		execute: ({ writer }) => {
			const currentId = nanoid();
			const result = streamText({
				model: azure("gpt-4.1"),
				system: `
                <instructions>
                    <language>
                        - IMPORTANT: If user asked in Bahasa Malaysia, you will be providing all information answer in Bahasa Malaysia, do not answer in English or Bahasa Indonesia.
                    </language>

                    <workflow>
                        You are a marketing intelligence assistant that helps users make data-driven advertising decisions.
                        Use the advertisement analysis tool when users ask about:
                        - Best times to advertise to specific demographics
                        - Optimal days/times for different age groups or genders
                        - Audience engagement patterns
                        - When to show advertisements for maximum reach
                    </workflow>

                    <tools>
                        <tool name="getLatestTopicTool">
                            <use_case>When user mentioned 'right now', it usually mean the last 7 days</use_case>
                            <action></action>
                        </tool>

                        <tool name="getPortalBeritaAudienceAnalysisTool">
                            <use_case>Use when user asks about audience engagement timing, optimal times for content, or when to target specific demographics for Portal Berita. Examples:
                            - "When is the best time to target young women on Portal Berita?"
                            - "Peak engagement times for male 25-34 age group"
                            - "What days have highest Portal Berita traffic for all genders?"
                            - "When should I publish content for young adults?"
                            - "Optimal timing for Portal Berita content distribution"
                            </use_case>
                            <action>Provides data-driven recommendations for Portal Berita audience engagement timing based on demographic analysis</action>
                        </tool>

                        <tool name="getRTMKlikAudienceAnalysisTool">
                            <use_case>Use when user asks about audience engagement timing, optimal times for content, or when to target specific demographics for RTMKlik platform. Examples:
                            - "When is the best time to target young women on RTMKlik?"
                            - "Peak engagement times for male 25-34 age group on RTMKlik"
                            - "What days have highest RTMKlik traffic for all genders?"
                            - "When should I publish content for young adults on RTMKlik?"
                            - "Optimal timing for RTMKlik video/streaming content distribution"
                            - "Best times to advertise on RTMKlik streaming platform"
                            </use_case>
                            <action>Provides data-driven recommendations for RTMKlik audience engagement timing based on demographic analysis for the streaming platform</action>
                        </tool>
                    </tools>
                </instructions>`,
				messages: convertToModelMessages(messages),
				stopWhen: stepCountIs(5),
				tools: {
					getLatestTopicTool: tool({
						description: "To find the latest trending topics",
						inputSchema: z.object({
							days: z
								.number()
								.describe("The number of days for the trending topics"),
						}),
						execute: async ({ days }) => {},
					}),

					getPortalBeritaAudienceAnalysisTool: tool({
						description: "Get Portal Berita audience engagement timing recommendations based on demographics analysis",
						inputSchema: z.object({
							gender: genderEnum
								.optional()
								.describe("Target gender: male, female, or all (default: all)"),
							ageRange: ageRangeEnum
								.optional()
								.describe("Target age range: 18-24, 25-34, 35-44, 45-54, 55-64, or all (default: all)"),
							dayFilter: dayFilterEnum
								.optional()
								.describe("Day filter: specific day name, weekdays, weekends, or all (default: all)"),
						}),
						execute: async ({ gender, ageRange, dayFilter }) => {
							try {
								console.log('Calling Portal Berita audience analysis function with filters:', { gender, ageRange, dayFilter });

								// Use the direct function call instead of API endpoint
								const data = await fetchPortalBeritaAudienceData({
									gender,
									ageRange,
									dayFilter,
									analysis: true
								});

								console.log('Portal Berita audience analysis result:', data);

								if (!data.success) {
									throw new Error(data.error || 'Analysis function failed');
								}

								return {
									success: true,
									analysis: data.analysis,
									rawData: data.rawData
								};

							} catch (error: any) {
								console.error('Portal Berita audience analysis tool error:', error);
								return {
									success: false,
									error: error.message,
									analysis: {
										targetDemographic: 'Analysis failed',
										recommendations: { bestTimes: [], peakDays: [], peakHours: [] },
										insights: { trend: 'Unable to analyze due to error' }
									}
								};
							}
						},
					}),

					getRTMKlikAudienceAnalysisTool: tool({
						description: "Get RTMKlik streaming platform audience engagement timing recommendations based on demographics analysis",
						inputSchema: z.object({
							gender: genderEnum
								.optional()
								.describe("Target gender: male, female, or all (default: all)"),
							ageRange: ageRangeEnum
								.optional()
								.describe("Target age range: 18-24, 25-34, 35-44, 45-54, 55-64, or all (default: all)"),
							dayFilter: dayFilterEnum
								.optional()
								.describe("Day filter: specific day name, weekdays, weekends, or all (default: all)"),
						}),
						execute: async ({ gender, ageRange, dayFilter }) => {
							try {
								console.log('Calling RTMKlik audience analysis function with filters:', { gender, ageRange, dayFilter });

								// Use the direct function call instead of API endpoint
								const data = await fetchRTMKlikAudienceData({
									gender,
									ageRange,
									dayFilter,
									analysis: true
								});

								console.log('RTMKlik audience analysis result:', data);

								if (!data.success) {
									throw new Error(data.error || 'Analysis function failed');
								}

								return {
									success: true,
									analysis: data.analysis,
									rawData: data.rawData
								};

							} catch (error: any) {
								console.error('RTMKlik audience analysis tool error:', error);
								return {
									success: false,
									error: error.message,
									analysis: {
										targetDemographic: 'Analysis failed',
										recommendations: { bestTimes: [], peakDays: [], peakHours: [] },
										insights: { trend: 'Unable to analyze due to error' }
									}
								};
							}
						},
					}),
				},
				onStepFinish({ toolCalls }) {
					console.log({ toolCalls });
				},
				onFinish() {},
			});

			writer.merge(result.toUIMessageStream());
		},
	});

	return createUIMessageStreamResponse({ stream });
}

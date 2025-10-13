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

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const azure = createAzure({
	resourceName: process.env.AZURE_RESOURCE_NAME, // Azure resource name
	apiKey: process.env.AZURE_API_KEY,
});

// Types
export type SocialMediaMessage = UIMessage<
	never, // metadata type
	{
		latestTopic:
			| { status: "searching" }
			| { status: "found"; topicSummary: string };
		cardUI:
			| { status: "loading" }
			| { status: "finish"; title: string; contents: string; type: string };
	} // data parts type,
>;

export async function POST(req: Request) {
	const {
		messages,
	}: {
		messages: UIMessage[];
	} = await req.json();

	// Implement Data Stream
	const stream = createUIMessageStream<SocialMediaMessage>({
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
                        1. Analyze the user's query type:
                           - **Social Media Content** (mentions, tweets, posts, trends):
                             → Use getLatestTopicTool OR getHighInteractionsTool
                             → DO NOT use braveSearchTool
                           - **General Information** (celebrity info, news, facts, web content):
                             → Proceed to step 2

                        2. For general information queries, use TWO-STEP approach:
                           - **Step 2a**: Use social media tools FIRST to identify specific people/entities:
                             * If looking for trending celebrities → use getLatestTopicTool
                             * If looking for popular personalities → use getHighInteractionsTool
                           - **Step 2b**: Then use braveSearchTool with specific names/entities found
                             → Search for detailed information about identified people/entities

                        3. **IMPORTANT**: Never use braveSearchTool for:
                           - Analyzing mentions, tweets, or posts
                           - Social media trend analysis
                           - Engagement metrics or discussions

                        4. Always display successful results using showCardTool
                        5. When using showCardTool, inform user to refer to the card shown
                    </workflow>

                    <tools>
                        <tool name="getLatestTopicTool">
                            <use_case>When user mentioned 'right now', it usually mean the last 7 days</use_case>
                            <action>If successful, display the summary in a card format using 'showCardTool'</action>
                        </tool>

                        <tool name="getHighInteractionsTool">
                            <use_case>Use this when user asks for mentions with highest interactions, engagement, or highest discussion mentions</use_case>
                            <use_case>When user mentioned 'right now', it usually mean the last 7 days</use_case>
                            <action>If successful, display the summary in a card format using 'showCardTool'</action>
                        </tool>

                        <tool name="braveSearchTool">
                            <prerequisite>ALWAYS use getLatestTopicTool or getHighInteractionsTool FIRST to identify specific people/entities, then use braveSearchTool with those specific names</prerequisite>
                            <use_case>ONLY for general web content - NEVER for social media content</use_case>
                            <use_case>Perfect for celebrity biographies, news articles, factual information, general web content</use_case>
                            <important>NEVER use for: mentions, tweets, posts, social media trends, engagement analysis, or discussions</important>
                            <workflow>
                                1. First identify who/what to search for using social media tools
                                2. Then search for detailed information using specific names/entities found
                            </workflow>
                            <parameters>
                                <freshness>Use based on user request: 'pd' (past day), 'pw' (past week), 'pm' (past month), 'py' (past year)</freshness>
                                <localization>Automatically searches in Bahasa Malaysia and Malaysia region for local relevance</localization>
                            </parameters>
                            <action>If successful, display the summary in a card format using 'showCardTool'</action>
                        </tool>

                        <tool name="showCardTool">
                            <important>When this tool is used, tell the user to refer to the card shown. DO NOT RETURN ANY RESULT FROM OTHER TOOLS.</important>
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
						execute: async ({ days }) => {
							writer.write({
								type: "data-cardUI",
								id: `cardUI-${currentId}`,
								data: {
									status: "loading",
								},
							});
							const result = await getLatestTopics(days);

							if (result.length === 0) {
								return {
									status: "No trending topics was found.",
								};
							}

							const { text } = await generateText({
								model: azure("gpt-4o-mini"),
								prompt: `Summarized these mentions for the current latest trending topics.
                                    ${result.map((item) => item.mention)}
                                `,
							});

							return {
								status: "Success",
								summary: text,
							};
						},
					}),
					showCardTool: tool({
						description: "To show information or data into card UI",
						inputSchema: z.object({
							title: z.string().describe("The card title"),
							content: z.string().describe("The card contents"),
							type: z
								.string()
								.describe(
									"The one word type of the information show about. example: Trending"
								),
						}),
						execute: async ({ title, content, type }) => {
							writer.write({
								type: "data-cardUI",
								id: `cardUI-${currentId}`,
								data: {
									status: "finish",
									title,
									contents: content,
									type,
								},
							});
						},
					}),
					getHighInteractionsTool: tool({
						description:
							"To find mentions with the highest interactions/engagement",
						inputSchema: z.object({
							days: z
								.number()
								.describe(
									"The number of days to search for high-interaction mentions"
								),
						}),
						execute: async ({ days }) => {
							writer.write({
								type: "data-cardUI",
								id: `cardUI-${currentId}`,
								data: {
									status: "loading",
								},
							});
							const result = await getHighInteractionMentions(days);

							if (result.length === 0) {
								return {
									status: "No high-interaction mentions were found.",
								};
							}

							const { text } = await generateText({
								model: azure("gpt-4o-mini"),
								prompt: `Summarized these mentions with the highest interactions and engagement.
                                    ${result.map((item) => item.mention)}
                                `,
							});

							return {
								status: "Success",
								summary: text,
							};
						},
					}),
					braveSearchTool: tool({
						description:
							"To search the web using Brave Search API for current information",
						inputSchema: z.object({
							query: z
								.string()
								.describe(
									"If user asked in Bahasa Malaysia, query also in Bahasa Malaysia. Not Bahasa Indonesia or English. The detailed search query - be specific and include relevant keywords for better results"
								),
							freshness: z
								.enum(["pd", "pw", "pm", "py"])
								.optional()
								.describe(
									"Result freshness: pd (past day), pw (past week), pm (past month), py (past year)"
								),
							count: z
								.number()
								.min(1)
								.max(20)
								.optional()
								.describe("Number of results to return (max 20)"),
							result_filter: z
								.string()
								.optional()
								.describe(
									"Filter result types: web, news, videos, locations, infobox"
								),
						}),
						execute: async ({ query, freshness, count, result_filter }) => {
							writer.write({
								type: "data-cardUI",
								id: `cardUI-${currentId}`,
								data: {
									status: "loading",
								},
							});

							console.log({ query, freshness });

							try {
								const braveClient = createBraveSearchClient();

								const searchOptions: BraveSearchOptions = {
									count: count || 20,
									freshness: freshness || "py", // Default to past week
									result_filter: result_filter || "web,news",
									country: "MY", // Always set to Malaysia
								};

								const result = await braveClient.search(query, searchOptions);

								// Combine web and news results for summarization
								const allResults = [
									...(result.web?.results || []),
									...(result.news?.results || []),
								];

								if (allResults.length === 0) {
									return {
										status: "No results found for your search query.",
									};
								}

								// Prepare results for summarization
								const resultsText = allResults
									.slice(0, 10) // Take top 10 results
									.map(
										(item, index) =>
											`${index + 1}. ${item.title}\n   ${
												item.description
											}\n   URL: ${item.url}\n   Age: ${item.age || "Unknown"}`
									)
									.join("\n\n");

								const { text } = await generateText({
									model: azure("gpt-4o-mini"),
									prompt: `Untuk pertanyaan: "${query}"

									Hasil Carian Bahasa Malaysia:
									${resultsText}

									Sediakan ringkasan yang padat dan terperinci dalam Bahasa Malaysia yang merangkumi:
									- Maklumat yang paling relevan
									- Penemuan utama dan fakta penting
									- Sumber-sumber yang boleh dipercayai
									- Konteks tempatan Malaysia jika berkaitan
									Jawapan hendaklah komprehensif dan mudah difahami.`,
								});

								return {
									status: "Success",
									summary: text,
									totalResults: allResults.length,
									// query: query,
								};
							} catch (error) {
								console.error("Brave Search error:", error);
								return {
									status: "Search failed. Please try again later.",
									error:
										error instanceof Error ? error.message : "Unknown error",
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

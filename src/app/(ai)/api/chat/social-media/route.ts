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
				model: azure("gpt-4o-mini"),
				system: `
                Language
                - IMPORTANT: If user asked in Bahasa Malaysia, you will be providing all information answer in Bahasa Malaysia, do not answer in English or Bahasa Indonesia.

                Tools Usage:
                getLatestTopicTool
                - When user mentioned 'right now', it usually mean the last 7 days
                - If it is success, display the summary in a card format using 'showCardTool'.

                getHighInteractionsTool
                - Use this when user asks for mentions with highest interactions, engagement, or highest discussion mentions
                - When user mentioned 'right now', it usually mean the last 7 days
                - If it is success, display the summary in a card format using 'showCardTool'.

                <IMPORTANT>
                showCardTool
                - when this tool is used, tell the user the refer to the card shown
                </IMPORTANT>`,
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

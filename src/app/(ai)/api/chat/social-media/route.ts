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
import { z } from "zod";
import { nanoid } from "nanoid";
import { getLatestTopics } from "@/lib/ai-tools/social-media/get-latest-topics";

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
			| { status: "searching"; topicSummary?: never }
			| { status: "found"; topicSummary: string };
	} // data parts type
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
			const result = streamText({
				model: azure("gpt-4o-mini"),
				system: `Tools Usage:
                getLatestTopicTool
                - When user mentioned 'right now', it usually mean the last 7 days
                - If it is success, say refer to the above information given.`,
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
							const currentId = nanoid();
							writer.write({
								type: "data-latestTopic",
								id: `latestTopic-${currentId}`,
								data: {
									status: "searching",
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

							writer.write({
								type: "data-latestTopic",
								id: `latestTopic-${currentId}`,
								data: {
									topicSummary: text,
									status: "found",
								},
							});
							return {
								status:
									"Latest Topics Summary Succesfully Generated, refer to the above",
							};
						},
					}),
				},
				onFinish() {},
			});

			writer.merge(result.toUIMessageStream());
		},
	});

	return createUIMessageStreamResponse({ stream });
}

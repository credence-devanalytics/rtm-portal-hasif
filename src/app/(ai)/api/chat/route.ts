import {
	streamText,
	UIMessage,
	convertToModelMessages,
	createUIMessageStream,
	createUIMessageStreamResponse,
} from "ai";
import { createAzure } from "@ai-sdk/azure";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const azure = createAzure({
	resourceName: process.env.AZURE_RESOURCE_NAME, // Azure resource name
	apiKey: process.env.AZURE_API_KEY,
});

// Types
export type ExampleMessage = UIMessage<
	never, // metadata type
	{
		weather: {
			city: string;
			weather?: string;
			status: "loading" | "success";
		};
		notification: {
			message: string;
			level: "info" | "warning" | "error";
		};
	} // data parts type
>;

export async function POST(req: Request) {
	const {
		messages,
	}: {
		messages: UIMessage[];
	} = await req.json();

	// Implement Data Stream
	const stream = createUIMessageStream<ExampleMessage>({
		execute: ({ writer }) => {
			// 1. Send initial status (transient - won't be added to message history)
			writer.write({
				type: "data-notification",
				data: { message: "Processing your request...", level: "info" },
				transient: true, // This part won't be added to message history
			});

			// 3. Send data parts with loading state
			writer.write({
				type: "data-weather",
				id: "weather-1",
				data: { city: "San Francisco", status: "loading" },
			});

			const result = streamText({
				model: azure("gpt-4o-mini"),
				messages: convertToModelMessages(messages),
				onFinish() {
					// 4. Update the same data part (reconciliation)
					writer.write({
						type: "data-weather",
						id: "weather-1", // Same ID = update existing part
						data: {
							city: "San Francisco",
							weather: "sunny",
							status: "success",
						},
					});

					// 5. Send completion notification (transient)
					writer.write({
						type: "data-notification",
						data: { message: "Request completed", level: "info" },
						transient: true, // Won't be added to message history
					});
				},
			});

			writer.merge(result.toUIMessageStream());
		},
	});

	return createUIMessageStreamResponse({ stream });
}

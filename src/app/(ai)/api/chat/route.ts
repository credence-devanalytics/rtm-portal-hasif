import {
	streamText,
	UIMessage,
	convertToModelMessages,
	createUIMessageStream,
	createUIMessageStreamResponse,
	stepCountIs,
} from "ai";
import { createAzure } from "@ai-sdk/azure";
import { z } from "zod";

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

			const result = streamText({
				model: azure("gpt-4o-mini"),
				messages: convertToModelMessages(messages),
				stopWhen: stepCountIs(5),
				tools: {
					// server-side tool with execute function:
					getWeatherInformation: {
						description: "show the weather in a given city to the user",
						inputSchema: z.object({ city: z.string() }),
						execute: async ({ city }: { city: string }) => {
							const weatherOptions = [
								"sunny",
								"cloudy",
								"rainy",
								"snowy",
								"windy",
							];
							// 3. Send data parts with loading state
							writer.write({
								type: "data-weather",
								id: "weather-1",
								data: { city, status: "loading" },
							});

							const weather =
								weatherOptions[
									Math.floor(Math.random() * weatherOptions.length)
								];
							// 4. Update the same data part (reconciliation)
							writer.write({
								type: "data-weather",
								id: "weather-1", // Same ID = update existing part
								data: {
									city,
									weather,
									status: "success",
								},
							});
							return weather;
						},
					},
				},
				onFinish() {
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

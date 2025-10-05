import { streamText, UIMessage, convertToModelMessages } from "ai";
import { createAzure } from "@ai-sdk/azure";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const azure = createAzure({
	resourceName: process.env.AZURE_RESOURCE_NAME, // Azure resource name
	apiKey: process.env.AZURE_API_KEY,
});

export async function POST(req: Request) {
	const {
		messages,
	}: {
		messages: UIMessage[];
	} = await req.json();

	const result = streamText({
		model: azure("gpt-4o-mini"),
		messages: convertToModelMessages(messages),
		system:
			"You are a helpful assistant that can answer questions and help with tasks",
	});

	// send sources and reasoning back to the client
	return result.toUIMessageStreamResponse();
}

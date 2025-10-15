"use client";

import { useState } from "react";
import { Fragment } from "react";
import ChatBot from "@/components/ai/chatbot";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ExampleMessage } from "@/app/(ai)/api/chat/route";
import { Header, Starters } from "@/components/ai/empty-state";
import { conversationStarters } from "@/data/conversation-starters";
import { toast } from "sonner";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";

export default function AIPage() {
	const [input, setInput] = useState("");
	const chatHook = useChat<ExampleMessage>({
		transport: new DefaultChatTransport({
			api: "/api/chat",
		}),
		onData: (dataPart) => {
			if (dataPart.type === "data-notification") {
				console.log({ message: dataPart.data.message });
				toast(dataPart.data.message);
			}
		},
	});

	const handleSubmit = (message: PromptInputMessage) => {
		const hasText = Boolean(message.text);
		const hasAttachments = Boolean(message.files?.length);

		if (!(hasText || hasAttachments)) {
			return;
		}

		chatHook.sendMessage(
			{
				text: message.text || "Sent with attachments",
				files: message.files,
			},
			{
				body: {},
			}
		);
		setInput("");
	};

	return (
		// <ChatBot<ExampleMessage> this also can
		<ChatBot
			chatHook={chatHook}
			onSubmit={handleSubmit}
			input={input}
			onInputChange={setInput}
			sidebar={true}
						header={
				<Header
					title="Ask me anything about RTM"
					description="Get insights about social media trends and conversations"
				/>
			}
			starters={<Starters starters={conversationStarters} />}
			toolMessageComponents={{
				"data-weather": (message, part) => (
					<Fragment>
						<Message from={message.role}>
							<MessageContent>
								{part.data.status === "loading" ? (
									<Response>{`Getting weather for ${part.data.city}...`}</Response>
								) : (
									<Response>{`Weather in ${part.data.city}: ${part.data.weather}`}</Response>
								)}
							</MessageContent>
						</Message>
					</Fragment>
				),
			}}
		/>
	);
}

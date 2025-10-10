"use client";

import { useState } from "react";
import { Fragment } from "react";
import ChatBot from "@/components/ai/chatbot";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Header, Starters } from "@/components/ai/empty-state";
import { conversationStarters } from "@/data/conversation-starters";
import { toast } from "sonner";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { SocialMediaMessage } from "../../api/chat/social-media/route";
import { LatestTopic } from "@/components/ai/latest-topic";

export default function AIPage() {
	const [input, setInput] = useState("");
	const chatHook = useChat<SocialMediaMessage>({
		transport: new DefaultChatTransport({
			api: "/api/chat/social-media",
		}),
		onData: (dataPart) => {},
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
				"data-latestTopic": (message, part) => <LatestTopic message={message} part={part} />,
			}}
		/>
	);
}

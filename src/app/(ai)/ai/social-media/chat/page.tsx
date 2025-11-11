"use client";

import { useState } from "react";
import ChatBot from "@/components/ai/chatbot";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Header, Starters } from "@/components/ai/empty-state";
import { conversationStarters } from "@/data/conversation-starters";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { SocialMediaMessage } from "../../../api/chat/social-media/route";
import { CardUI } from "@/components/ai/card-ui";

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
			sidebar={false}
			header={
				<Header
					title="Ask me anything about RTM Social Media"
					description="Get insights about social media trends and conversations"
				/>
			}
			starters={<Starters starters={conversationStarters} />}
			toolMessageComponents={{
				// "data-latestTopic": (message, part) => <LatestTopic message={message} part={part} />,
				"data-cardUI": (message, part) => (
					<CardUI message={message} part={part} />
				),
			}}
		/>
	);
}

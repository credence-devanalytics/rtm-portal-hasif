"use client";

import { useState } from "react";
import ChatBot from "@/components/ai/chatbot";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Header, Starters } from "@/components/ai/empty-state";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { MarketingMessage } from "../../../api/chat/marketing/route";

// Define Bahasa Malaysia conversation starters for audience analysis
const marketingStarters = [
	"Bila waktu terbaik untuk menyiarkan iklan kepada wanita muda di Portal Berita?",
	"Apakah hari dan masa yang paling sesuai untuk mencapai audiens lelaki 25-34 tahun?",
	"Analisis traffic tertinggi untuk semua kumpulan umur di RTMKlik?",
	"Waktu puncak penggunaan RTMKlik untuk kandungan hiburan?",
];

export default function AIPage() {
	const [input, setInput] = useState("");
	const [showModal, setShowModal] = useState(false);
	const chatHook = useChat<MarketingMessage>({
		transport: new DefaultChatTransport({
			api: "/api/chat/marketing",
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
					title="Ask me anything about RTM Marketing"
					description="Get insights about social media trends and conversations"
				/>
			}
			starters={<Starters starters={marketingStarters} />}
			actionButtons={[
				{
					id: "clear-chat",
					label: "Clear",
					onClick: () =>
						chatHook.messages.length > 0 && chatHook.setMessages([]),
					disabled: chatHook.messages.length === 0,
					variant: "outline" as const,
					tooltip: "Clear all messages",
				},
			]}
			toolMessageComponents={
				{
					// "data-latestTopic": (message, part) => <LatestTopic message={message} part={part} />,
					// "data-cardUI": (message, part) => (
					// 	<CardUI message={message} part={part} />
					// ),
				}
			}
		/>
	);
}

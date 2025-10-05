"use client";

import {
	Conversation,
	ConversationContent,
	ConversationEmptyState,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
	PromptInput,
	PromptInputBody,
	type PromptInputMessage,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputToolbar,
	PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Actions, Action } from "@/components/ai-elements/actions";
import { Fragment, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Response } from "@/components/ai-elements/response";
import { CopyIcon, MessageSquare, RefreshCcwIcon } from "lucide-react";
import {
	Source,
	Sources,
	SourcesContent,
	SourcesTrigger,
} from "@/components/ai-elements/sources";
import { Loader } from "@/components/ai-elements/loader";
import {
	EmptyState,
	Header,
	Starters,
	Starter,
} from "@/components/ai/empty-state";
import { DefaultChatTransport } from "ai";
import { ExampleMessage } from "@/app/(ai)/api/chat/route";
import { toast } from "sonner";
import { conversationStarters } from "@/data/conversation-starters";

const models = [
	{
		name: "GPT 4o",
		value: "openai/gpt-4o",
	},
	{
		name: "Deepseek R1",
		value: "deepseek/deepseek-r1",
	},
];

const ChatBot = () => {
	const [input, setInput] = useState("");
	const { messages, sendMessage, status, regenerate } = useChat<ExampleMessage>(
		{
			transport: new DefaultChatTransport({
				api: "/api/chat",
			}),
			onData: (dataPart) => {
				if (dataPart.type === "data-notification") {
					console.log({ message: dataPart.data.message });
					toast(dataPart.data.message);
				}
			},
		}
	);

	const handleSubmit = (message: PromptInputMessage) => {
		const hasText = Boolean(message.text);
		const hasAttachments = Boolean(message.files?.length);

		if (!(hasText || hasAttachments)) {
			return;
		}

		sendMessage(
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
		<div className="max-w-9xl mx-auto relative size-full">
			<div className="flex flex-col h-full">
				<Conversation className="h-full">
					<ConversationContent>
						{messages.length === 0 ? (
							<EmptyState onSubmit={handleSubmit}>
								<Header
									title="Ask me anything about RTM"
									description="Get insights about social media trends and conversations"
								/>
								<Starters starters={conversationStarters} />
							</EmptyState>
						) : (
							messages.map((message) => (
								<div key={message.id}>
									{message.role === "assistant" &&
										message.parts.filter((part) => part.type === "source-url")
											.length > 0 && (
											<Sources>
												<SourcesTrigger
													count={
														message.parts.filter(
															(part) => part.type === "source-url"
														).length
													}
												/>
												{message.parts
													.filter((part) => part.type === "source-url")
													.map((part, i) => (
														<SourcesContent key={`${message.id}-${i}`}>
															<Source
																key={`${message.id}-${i}`}
																href={part.url}
																title={part.url}
															/>
														</SourcesContent>
													))}
											</Sources>
										)}
									{message.parts.map((part, i) => {
										switch (part.type) {
											case "data-weather":
												return (
													<Fragment key={`${message.id}-${i}`}>
														<Message from={message.role}>
															<MessageContent>
																{part.data.status === "loading" ? (
																	<Response
																		key={i}
																	>{`Getting weather for ${part.data.city}...`}</Response>
																) : (
																	<Response
																		key={i}
																	>{`Weather in ${part.data.city}: ${part.data.weather}`}</Response>
																)}
															</MessageContent>
														</Message>
													</Fragment>
												);
											case "text":
												return (
													<Fragment key={`${message.id}-${i}`}>
														<Message from={message.role}>
															<MessageContent>
																<Response>{part.text}</Response>
															</MessageContent>
														</Message>
														{message.role === "assistant" &&
															i === messages.length - 1 && (
																<Actions className="mt-2">
																	<Action
																		onClick={() => regenerate()}
																		label="Retry"
																	>
																		<RefreshCcwIcon className="size-3" />
																	</Action>
																	<Action
																		onClick={() =>
																			navigator.clipboard.writeText(part.text)
																		}
																		label="Copy"
																	>
																		<CopyIcon className="size-3" />
																	</Action>
																</Actions>
															)}
													</Fragment>
												);
											default:
												return null;
										}
									})}
								</div>
							))
						)}
						{status === "submitted" && <Loader />}
					</ConversationContent>
					<ConversationScrollButton />
				</Conversation>

				<PromptInput
					onSubmit={handleSubmit}
					className="mt-4"
					globalDrop
					multiple
				>
					<PromptInputBody>
						<PromptInputTextarea
							onChange={(e) => setInput(e.target.value)}
							value={input}
						/>
					</PromptInputBody>
					<PromptInputToolbar>
						<PromptInputTools />
						<PromptInputSubmit disabled={!input && !status} status={status} />
					</PromptInputToolbar>
				</PromptInput>
			</div>
		</div>
	);
};

export default ChatBot;

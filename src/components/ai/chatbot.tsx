"use client";

import { UIMessage } from "ai";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
	PromptInput,
	PromptInputBody,
	type PromptInputMessage,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputToolbar,
	PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Fragment } from "react";
import { Loader } from "@/components/ai-elements/loader";
import { EmptyState } from "@/components/ai/empty-state";
import {
	TextMessagePart,
	SourceMessagePart,
	getSourceUrlParts,
	hasSourceUrls,
} from "@/components/ai/message-parts";

// Type for tool message components
export type ToolMessageComponents<T extends UIMessage<any, any>> = {
	[K in Extract<T['parts'][number]['type'], `data-${string}`>]?: (
		message: T,
		part: Extract<T['parts'][number], { type: K }>
	) => React.ReactNode;
};

interface ChatBotProps<T extends UIMessage<any, any>> {
	messages: T[];
	sendMessage: any;
	status: any;
	regenerate: () => void;
	onSubmit: (message: PromptInputMessage) => void;
	input: string;
	onInputChange: (value: string) => void;
	header?: React.ReactNode;
	starters?: React.ReactNode;
	toolMessageComponents?: ToolMessageComponents<T>;
}

const ChatBot = <T extends UIMessage<any, any>>({
	messages,
	status,
	regenerate,
	onSubmit,
	input,
	onInputChange,
	header,
	starters,
	toolMessageComponents,
}: ChatBotProps<T>) => {

	return (
		<div className="max-w-9xl mx-auto relative size-full">
			<div className="flex flex-col h-full">
				<Conversation className="h-full">
					<ConversationContent>
						{messages.length === 0 ? (
							<EmptyState onSubmit={onSubmit}>
								{header}
								{starters}
							</EmptyState>
						) : (
							messages.map((message, messageIndex) => (
								<div key={message.id}>
									{/* Render sources if this is an assistant message with source URLs */}
									{message.role === "assistant" && hasSourceUrls(message) &&
										getSourceUrlParts(message).map((part, i) => (
											<SourceMessagePart
												key={`${message.id}-source-${i}`}
												message={message}
												part={part}
											/>
										))
									}

									{/* Render message parts using generic type-safe mapping */}
									{message.parts.map((part, partIndex) => {
										const isLastMessage = messageIndex === messages.length - 1;

										// Handle text parts internally
										if (part.type === "text") {
											return (
												<TextMessagePart
													key={`${message.id}-${partIndex}`}
													message={message}
													part={part as Extract<T['parts'][number], { type: 'text' }>}
													isLastMessage={isLastMessage}
													onRegenerate={regenerate}
												/>
											);
										}

										// Handle tool message components from parent
										if (toolMessageComponents && part.type in toolMessageComponents) {
											const ToolComponent = toolMessageComponents[part.type as keyof typeof toolMessageComponents];
											if (ToolComponent) {
												return (
													<Fragment key={`${message.id}-${partIndex}`}>
														{ToolComponent(message, part as any)}
													</Fragment>
												);
											}
										}

										return null;
									})}
								</div>
							))
						)}
						{status === "submitted" && <Loader />}
					</ConversationContent>
					<ConversationScrollButton />
				</Conversation>

				<PromptInput
					onSubmit={onSubmit}
					className="mt-4"
					globalDrop
					multiple
				>
					<PromptInputBody>
						<PromptInputTextarea
							onChange={(e) => onInputChange(e.target.value)}
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

export default ChatBot as <T extends UIMessage<any, any>>(props: ChatBotProps<T>) => React.ReactElement;

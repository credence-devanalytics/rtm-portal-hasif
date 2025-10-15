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
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ai/app-sidebar";
import { Button } from "@/components/ui/button";

// Type for tool message components
export type ToolMessageComponents<T extends UIMessage<any, any>> = {
	[K in Extract<T["parts"][number]["type"], `data-${string}`>]?: (
		message: T,
		part: Extract<T["parts"][number], { type: K }>
	) => React.ReactNode;
};

interface ChatBotProps<T extends UIMessage<any, any>> {
	chatHook: {
		messages: T[];
		sendMessage: any;
		status: any;
		regenerate: () => void;
	};
	onSubmit: (message: PromptInputMessage) => void;
	input: string;
	onInputChange: (value: string) => void;
	header?: React.ReactNode;
	starters?: React.ReactNode;
	toolMessageComponents?: ToolMessageComponents<T>;
	sidebar?: boolean;
}

// Inner component that contains the actual chatbot content
const ChatBotContent = <T extends UIMessage<any, any>>({
	chatHook,
	onSubmit,
	input,
	onInputChange,
	header,
	starters,
	toolMessageComponents,
}: Omit<ChatBotProps<T>, "sidebar">) => {
	return (
		<div className="max-w-9xl mx-auto relative size-full">
			<div className="flex flex-col h-full">
				<Conversation className="h-full">
					<ConversationContent>
						{chatHook.messages.length === 0 ? (
							<EmptyState onSubmit={onSubmit}>
								{header}
								{starters}
							</EmptyState>
						) : (
							chatHook.messages.map((message, messageIndex) => (
								<div key={message.id}>
									{/* Render sources if this is an assistant message with source URLs */}
									{message.role === "assistant" &&
										hasSourceUrls(message) &&
										getSourceUrlParts(message).map((part, i) => (
											<SourceMessagePart
												key={`${message.id}-source-${i}`}
												message={message}
												part={part}
											/>
										))}

									{/* Render message parts using generic type-safe mapping */}
									{message.parts.map((part, partIndex) => {
										const isLastMessage =
											messageIndex === chatHook.messages.length - 1;

										// Handle text parts internally
										if (part.type === "text") {
											return (
												<TextMessagePart
													key={`${message.id}-${partIndex}`}
													message={message}
													part={
														part as Extract<
															T["parts"][number],
															{ type: "text" }
														>
													}
													isLastMessage={isLastMessage}
													onRegenerate={chatHook.regenerate}
												/>
											);
										}

										// Handle tool message components from parent
										if (
											toolMessageComponents &&
											part.type in toolMessageComponents
										) {
											const ToolComponent =
												toolMessageComponents[
													part.type as keyof typeof toolMessageComponents
												];
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
						{chatHook.status === "submitted" && <Loader />}
					</ConversationContent>
					<ConversationScrollButton />
				</Conversation>

				<PromptInput onSubmit={onSubmit} className="mt-4" globalDrop multiple>
					<PromptInputBody>
						<PromptInputTextarea
							onChange={(e) => onInputChange(e.target.value)}
							value={input}
						/>
					</PromptInputBody>
					<PromptInputToolbar>
						<PromptInputTools />
						<PromptInputSubmit
							disabled={!input && !chatHook.status}
							status={chatHook.status}
						/>
					</PromptInputToolbar>
				</PromptInput>
			</div>
		</div>
	);
};

const ChatBot = <T extends UIMessage<any, any>>({
	chatHook,
	onSubmit,
	input,
	onInputChange,
	header,
	starters,
	toolMessageComponents,
	sidebar,
}: ChatBotProps<T>) => {
	if (sidebar) {
		return (
			<SidebarProvider>
				<div className="flex size-full">
					<AppSidebar />
					<main className="pt-18 px-4 w-full h-[calc(100vh-4rem)]">
						<Button asChild size="icon" variant="outline">
							<SidebarTrigger />
						</Button>
						<ChatBotContent
							chatHook={chatHook}
							onSubmit={onSubmit}
							input={input}
							onInputChange={onInputChange}
							header={header}
							starters={starters}
							toolMessageComponents={toolMessageComponents}
						/>
					</main>
				</div>
			</SidebarProvider>
		);
	}

	return (
		<ChatBotContent
			chatHook={chatHook}
			onSubmit={onSubmit}
			input={input}
			onInputChange={onInputChange}
			header={header}
			starters={starters}
			toolMessageComponents={toolMessageComponents}
		/>
	);
};

export default ChatBot as <T extends UIMessage<any, any>>(
	props: ChatBotProps<T>
) => React.ReactElement;

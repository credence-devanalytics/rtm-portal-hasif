"use client";

import { Fragment } from "react";
import { UIMessage } from "ai";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
import { Actions, Action } from "@/components/ai-elements/actions";
import {
	Source,
	Sources,
	SourcesContent,
	SourcesTrigger,
} from "@/components/ai-elements/sources";

// Text Message Part Component (Universal)
export const TextMessagePart = <T extends UIMessage<any, any>>({
	message,
	part,
	isLastMessage,
	onRegenerate,
}: {
	message: T;
	part: Extract<T["parts"][number], { type: "text" }>;
	isLastMessage: boolean;
	onRegenerate: () => void;
}) => {
	return (
		<Fragment>
			<Message from={message.role}>
				<MessageContent>
					<Response>{part.text}</Response>
				</MessageContent>
			</Message>
			{message.role === "assistant" && isLastMessage && (
				<Actions className="mt-2">
					<Action onClick={onRegenerate} label="Retry">
						<RefreshCcwIcon className="size-3" />
					</Action>
					<Action
						onClick={() => navigator.clipboard.writeText(part.text)}
						label="Copy"
					>
						<CopyIcon className="size-3" />
					</Action>
				</Actions>
			)}
		</Fragment>
	);
};

// Source URL Message Part Component (Universal)
export const SourceMessagePart = <T extends UIMessage<any, any>>({
	message,
	part,
}: {
	message: T;
	part: T["parts"][number] & { type: "source-url"; url: string };
}) => {
	return (
		<Sources>
			<SourcesTrigger count={1} />
			<SourcesContent>
				<Source href={part.url} title={part.url} />
			</SourcesContent>
		</Sources>
	);
};

// Get all source URL parts from a message (Generic)
export const getSourceUrlParts = <T extends UIMessage<any, any>>(message: T) => {
	return message.parts.filter((part): part is (T["parts"][number] & { type: "source-url"; url: string }) =>
		part.type === "source-url" && "url" in part
	);
};

// Check if a message has any source URL parts (Generic)
export const hasSourceUrls = <T extends UIMessage<any, any>>(message: T) => {
	return getSourceUrlParts(message).length > 0;
};
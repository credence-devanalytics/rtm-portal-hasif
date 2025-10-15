"use client";

import { MessageSquare, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { conversationStarters } from "@/data/conversation-starters";
import { createContext, useContext } from "react";

// Context for compound components
interface EmptyStateContextValue {
	onSubmit: (message: PromptInputMessage) => void;
}

const EmptyStateContext = createContext<EmptyStateContextValue | null>(null);

const useEmptyStateContext = () => {
	const context = useContext(EmptyStateContext);
	if (!context) {
		throw new Error("EmptyState compound components must be used within EmptyState");
	}
	return context;
};

// Animated Sparkles Component
export const AnimatedSparkles = () => {
	return (
		<motion.div
			className="absolute text-blue-400 size-6"
			style={{
				top: "-15%",
				right: "-20%",
			}}
			animate={{
				y: [-8, 8],
			}}
			transition={{
				duration: 4,
				repeat: Infinity,
				repeatType: "reverse",
				ease: "easeInOut",
			}}
		>
			<Sparkles className="size-6" />
		</motion.div>
	);
};

// EmptyState Header Component
export const EmptyStateHeader = ({
	title = "Start a conversation",
	description = "Type a message below or click a card to begin chatting",
	icon
}: {
	title?: string;
	description?: string;
	icon?: React.ReactNode;
}) => {
	return (
		<div className="flex flex-col items-center gap-3">
			<div className="relative text-muted-foreground">
				{icon || <AnimatedSparkles />}
				<MessageSquare className="size-12" />
			</div>
			<div className="space-y-1">
				<h3 className="font-medium text-sm">{title}</h3>
				<p className="text-muted-foreground text-sm">{description}</p>
			</div>
		</div>
	);
};

// EmptyState Starter Component
export const EmptyStateStarter = ({
	starter,
	children
}: {
	starter: string;
	children?: React.ReactNode;
}) => {
	const { onSubmit } = useEmptyStateContext();

	const handleCardClick = () => {
		onSubmit({ text: starter });
	};

	return (
		<Card
			className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
			onClick={handleCardClick}
		>
			<CardHeader className="">
				<CardTitle className="text-sm leading-tight">{children || starter}</CardTitle>
			</CardHeader>
			{/* <CardContent className="pt-0">
				<CardDescription className="text-xs">
					Click to send this message
				</CardDescription>
			</CardContent> */}
		</Card>
	);
};

// EmptyState Starters Component
export const EmptyStateStarters = ({
	starters = conversationStarters
}: {
	starters?: readonly string[]
}) => {
	return (
		<div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
			{starters.map((starter) => (
				<EmptyStateStarter key={starter} starter={starter}>
					{starter}
				</EmptyStateStarter>
			))}
		</div>
	);
};

// Main EmptyState Component
interface EmptyStateProps {
	onSubmit: (message: PromptInputMessage) => void;
	children?: React.ReactNode;
}

export const EmptyState = ({ onSubmit, children }: EmptyStateProps) => {
	return (
		<EmptyStateContext.Provider value={{ onSubmit }}>
			<div className="flex size-full flex-col items-center justify-center gap-8 p-8 text-center">
				{children || (
					<>
						<EmptyStateHeader />
						<EmptyStateStarters />
					</>
				)}
			</div>
		</EmptyStateContext.Provider>
	);
};

// Export compound components for flexible usage
export {
	EmptyState as Root,
	EmptyStateHeader as Header,
	EmptyStateStarters as Starters,
	EmptyStateStarter as Starter,
};

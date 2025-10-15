"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUpIcon, LoaderIcon } from "lucide-react";
import { Response } from "@/components/ai-elements/response";
import type { SocialMediaMessage } from "../../app/(ai)/api/chat/social-media/route";

interface CardUIProps {
	message: SocialMediaMessage;
	part: Extract<SocialMediaMessage["parts"][number], { type: "data-cardUI" }>;
}

export function CardUI({ message, part }: CardUIProps) {
	const { data } = part;

	if (data.status === "loading") {
		return (
			<Card className="w-full max-w-2xl mx-auto">
				<CardHeader className="">
					<CardTitle className="flex items-center gap-2 text-lg">
						<TrendingUpIcon className="size-5 text-muted-foreground" />
						Loading...
					</CardTitle>
				</CardHeader>
				<CardContent className="">
					<div className="flex items-center gap-3 text-muted-foreground">
						<LoaderIcon className="size-4 animate-spin" />
						<span>Processing information...</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (data.status === "finish" && data.title && data.contents) {
		return (
			<Card className="w-full max-w-2xl mx-auto">
				<CardHeader className="">
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2 text-lg">
							<TrendingUpIcon className="size-5 text-muted-foreground" />
							{data.title}
						</CardTitle>
						{data.type && (
							<Badge variant="secondary" className="gap-1">
								<TrendingUpIcon className="size-3" />
								{data.type}
							</Badge>
						)}
					</div>
				</CardHeader>
				<CardContent className="">
					<div className="space-y-4">
						<div className="prose prose-sm max-w-none dark:prose-invert [&_p]:text-sm [&_p]:leading-relaxed">
							<Response>{data.contents}</Response>
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
							<TrendingUpIcon className="size-3" />
							<span>AI-generated content</span>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return null;
}

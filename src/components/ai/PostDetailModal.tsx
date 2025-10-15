"use client";

import { useState } from "react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Eye,
	Heart,
	MessageCircle,
	Share,
	TrendingUp,
	User,
	Clock,
	ExternalLink,
	Tag,
	Image as ImageIcon,
} from "lucide-react";
import {
	formatNumber,
	formatEngagementRate,
	formatDateTime,
	getPlatformConfig,
	getSentimentConfig,
	calculateTotalInteractions,
	getTopicBadgeColor,
	sanitizeUrl,
	cn,
} from "@/utils/mention-utils";

interface PostDetailModalProps {
	mention: {
		id: string;
		mention: string;
		author?: string;
		inserttime: string;
		photo?: string;
		originalphoto?: string;
		image?: string;
		reach?: number;
		likecount?: number;
		sharecount?: number;
		commentcount?: number;
		interaction?: number;
		engagementrate?: number;
		type?: string;
		sentiment?: string;
		topic?: string;
		url?: string;
	};
	children: React.ReactNode;
}

export function PostDetailModal({ mention, children }: PostDetailModalProps) {
	const [isImageLoading, setIsImageLoading] = useState(true);
	const [isImageError, setIsImageError] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	// Calculate derived values
	const platformConfig = getPlatformConfig(mention.type);
	const sentimentConfig = getSentimentConfig(mention.sentiment);
	const { date, time, relative } = formatDateTime(mention.inserttime);
	const totalInteractions = calculateTotalInteractions(
		mention.likecount,
		mention.sharecount,
		mention.commentcount
	);

	// Get the best available photo
	const photoUrl = mention.photo || mention.originalphoto || mention.image;
	const hasPhoto = photoUrl && !isImageError;

	// Handle image load events
	const handleImageLoad = () => {
		setIsImageLoading(false);
	};

	const handleImageError = () => {
		setIsImageLoading(false);
		setIsImageError(true);
	};

	const sanitizedUrl = sanitizeUrl(mention.url);

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		// Reset image loading state when modal opens
		if (open) {
			setIsImageLoading(true);
			setIsImageError(false);
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={handleOpenChange}>
			<SheetTrigger asChild>{children}</SheetTrigger>
			<SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2">
						<span>{platformConfig.icon}</span>
						Post Details
					</SheetTitle>
					<SheetDescription>
						Full post content and engagement metrics
					</SheetDescription>
				</SheetHeader>

				<div className="space-y-6 p-6">
					{/* Header Section */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Badge
								variant="outline"
								className={cn(
									"flex items-center gap-1 text-sm",
									platformConfig.bgColor,
									platformConfig.textColor,
									platformConfig.borderColor
								)}
							>
								<span>{platformConfig.icon}</span>
								<span className="font-medium">{platformConfig.name}</span>
							</Badge>

							<Badge
								variant="outline"
								className={cn(
									"flex items-center gap-1 text-sm",
									sentimentConfig.bgColor,
									sentimentConfig.textColor,
									sentimentConfig.borderColor
								)}
							>
								<span>{sentimentConfig.icon}</span>
								<span className="font-medium">{sentimentConfig.name}</span>
							</Badge>
						</div>

						<div className="flex items-center gap-1 text-sm text-gray-500">
							<Clock className="w-4 h-4" />
							<span>{relative}</span>
						</div>
					</div>

					{/* Author Section */}
					{mention.author && (
						<div className="flex items-center gap-3">
							<Avatar className="w-10 h-10">
								<AvatarImage src={undefined} />
								<AvatarFallback>
									{mention.author.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-medium text-gray-900">{mention.author}</p>
								<p className="text-sm text-gray-500">
									{date} at {time}
								</p>
							</div>
						</div>
					)}

					{/* Photo Section - Small display */}
					{hasPhoto && (
						<div className="flex justify-center">
							<div className="relative w-48 h-48 overflow-hidden rounded-lg">
								{isImageLoading && (
									<Skeleton className="absolute inset-0 w-full h-full" />
								)}
								<img
									src={photoUrl}
									alt="Post media"
									className={cn(
										"w-full h-full object-cover transition-opacity duration-200",
										isImageLoading ? "opacity-0" : "opacity-100"
									)}
									onLoad={handleImageLoad}
									onError={handleImageError}
								/>
							</div>
						</div>
					)}

					{/* Post Content */}
					<div className="space-y-3">
						<h3 className="text-lg font-semibold text-gray-900">Content</h3>
						<p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
							{mention.mention}
						</p>
					</div>

					{/* Engagement Metrics */}
					<div className="space-y-3">
						<h3 className="text-lg font-semibold text-gray-900">Engagement</h3>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							<div className="flex items-center gap-2">
								<Eye className="w-5 h-5 text-blue-500" />
								<div>
									<p className="font-semibold">
										{formatNumber(mention.reach || 0)}
									</p>
									<p className="text-xs text-gray-500">Reach</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<Heart className="w-5 h-5 text-red-500" />
								<div>
									<p className="font-semibold">
										{formatNumber(mention.likecount || 0)}
									</p>
									<p className="text-xs text-gray-500">Likes</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<MessageCircle className="w-5 h-5 text-blue-500" />
								<div>
									<p className="font-semibold">
										{formatNumber(mention.commentcount || 0)}
									</p>
									<p className="text-xs text-gray-500">Comments</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<Share className="w-5 h-5 text-green-500" />
								<div>
									<p className="font-semibold">
										{formatNumber(mention.sharecount || 0)}
									</p>
									<p className="text-xs text-gray-500">Shares</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<TrendingUp className="w-5 h-5 text-purple-500" />
								<div>
									<p className="font-semibold">
										{formatEngagementRate(mention.engagementrate || 0)}
									</p>
									<p className="text-xs text-gray-500">Engagement Rate</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<Tag className="w-5 h-5 text-indigo-500" />
								<div>
									<p className="font-semibold">{mention.topic || "N/A"}</p>
									<p className="text-xs text-gray-500">Topic</p>
								</div>
							</div>
						</div>
					</div>

					{/* Topic and Footer */}
					<div className="flex items-center justify-between pt-4 border-t border-gray-200">
						<div className="flex items-center gap-2">
							{mention.topic && (
								<Badge
									variant="outline"
									className={cn(getTopicBadgeColor(mention.topic))}
								>
									{mention.topic}
								</Badge>
							)}
						</div>

						{sanitizedUrl && (
							<Button
								variant="outline"
								size="sm"
								asChild
								className="flex items-center gap-2"
							>
								<a
									href={sanitizedUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									<ExternalLink className="w-4 h-4" />
									View Original
								</a>
							</Button>
						)}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}

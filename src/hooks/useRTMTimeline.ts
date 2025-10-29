import { useState, useEffect } from "react";

interface TimelineFilters {
	from: string;
	to: string;
	platform?: string;
	channel?: string;
	unit?: string;
}

interface MentionOverTime {
	date: string;
	facebook: number;
	instagram: number;
	twitter: number;
	tiktok: number;
	youtube: number;
	reddit: number;
	linkedin: number;
	other: number;
}

interface EngagementOverTime {
	date: string;
	reach: number;
	posts: number;
	interactions: number;
	engagementRate: number;
}

interface ClassificationData {
	category: string;
	count: number;
}

interface PopularMention {
	id: number;
	channel: string;
	title: string;
	content: string;
	platform: string;
	category: string;
	sentiment: string;
	reach: number;
	interactions: number;
	likecount: number;
	commentcount: number;
	sharecount: number;
	url: string;
	date: string;
	author: string;
	unit: string;
}

interface TimelineData {
	mentionsOverTime: MentionOverTime[];
	engagementOverTime: EngagementOverTime[];
	classificationData: ClassificationData[];
	popularMentions: PopularMention[];
	meta: {
		queryDate: string;
		filters: TimelineFilters;
		totalTime: string;
		counts: {
			mentionsOverTime: number;
			engagementOverTime: number;
			classifications: number;
			topMentions: number;
		};
	};
}

export function useRTMTimeline(filters: TimelineFilters) {
	const [data, setData] = useState<TimelineData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchTimeline = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams();
			if (filters.from) params.set("from", filters.from);
			if (filters.to) params.set("to", filters.to);
			if (filters.platform) params.set("platform", filters.platform);
			if (filters.channel) params.set("channel", filters.channel);
			if (filters.unit) params.set("unit", filters.unit);

			console.log("🔄 Fetching RTM Timeline with params:", params.toString());

			const response = await fetch(`/api/rtm-timeline?${params}`);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			
			console.log("✅ RTM Timeline data received:", {
				mentionsOverTime: result.mentionsOverTime?.length || 0,
				engagementOverTime: result.engagementOverTime?.length || 0,
				classifications: result.classificationData?.length || 0,
				topMentions: result.popularMentions?.length || 0,
			});

			setData(result);
		} catch (err) {
			console.error("❌ Error fetching RTM Timeline:", err);
			setError(err instanceof Error ? err : new Error("Unknown error"));
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchTimeline();
	}, [
		filters.from,
		filters.to,
		filters.platform,
		filters.channel,
		filters.unit,
	]);

	return {
		data,
		isLoading,
		error,
		refetch: fetchTimeline,
	};
}

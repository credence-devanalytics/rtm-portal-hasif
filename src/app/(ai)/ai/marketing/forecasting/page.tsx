"use client";
import React, { useState } from "react";
import ForecastingChart from "@/components/Marketing/ForecastingChart";
import SeasonalRevenueCalendar from "@/components/Marketing/SeasonalRevenueCalendar";
import Top10ChannelsChart from "@/components/Marketing/Top10ChannelsChart";
import { useMarketingForecasting } from "@/hooks/useMarketingForecasting";
import { useTop10ChannelsForecasting } from "@/hooks/useTop10ChannelsForecasting";

export default function ForecastingPage() {
	const { data, isLoading, error } = useMarketingForecasting();
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const {
		data: top10Data,
		isLoading: top10Loading,
		error: top10Error
	} = useTop10ChannelsForecasting(selectedCategory);

	return (
		<div className="pt-18 px-4 pb-8">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold font-sans text-gray-900 mb-2">
						Marketing Revenue Forecasting
					</h1>
					<p className="text-gray-600 font-sans">
						Analyze historical marketing channel performance and project future revenue trends
					</p>
				</div>

				<div className="space-y-8">
					{/* Revenue Forecast Chart */}
					<ForecastingChart
						data={data?.data}
						isLoading={isLoading}
						error={error?.message}
					/>

					{/* Top 10 Channels Chart */}
					<Top10ChannelsChart
						data={top10Data?.data}
						isLoading={top10Loading}
						error={top10Error?.message}
						selectedCategory={selectedCategory}
						onCategoryChange={setSelectedCategory}
					/>

					{/* Seasonal Revenue Calendar */}
					<SeasonalRevenueCalendar />
				</div>
			</div>
		</div>
	);
}

"use client";
import React from "react";
import ForecastingChart from "@/components/Marketing/ForecastingChart";
import SeasonalRevenueCalendar from "@/components/Marketing/SeasonalRevenueCalendar";
import { useMarketingForecasting } from "@/hooks/useMarketingForecasting";

export default function ForecastingPage() {
	const { data, isLoading, error } = useMarketingForecasting();

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

					{/* Seasonal Revenue Calendar */}
					<SeasonalRevenueCalendar />
				</div>
			</div>
		</div>
	);
}

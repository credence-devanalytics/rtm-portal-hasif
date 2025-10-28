"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

// TypeScript interfaces for seasonal data
interface SeasonalMonthData {
	month: string;
	monthIndex: number;
	totalRevenue: number;
	channels: {
		TV: number;
		RADIO: number;
		BES: number;
	};
	yearOverYearGrowth: number;
	isPeakMonth: boolean;
	isLowMonth: boolean;
	forecastAccuracy: number;
}

interface SeasonalCalendarData {
	months: SeasonalMonthData[];
	metadata: {
		year: number;
		currency: string;
		averageMonthlyRevenue: number;
		peakMonths: string[];
		lowMonths: string[];
	};
}

interface SeasonalRevenueCalendarProps {
	data?: SeasonalCalendarData;
	isLoading?: boolean;
	error?: string;
}

const SeasonalRevenueCalendar: React.FC<SeasonalRevenueCalendarProps> = ({
	data,
	isLoading,
	error,
}) => {
	// Generate mock data if no data provided
	const mockData: SeasonalCalendarData = React.useMemo(() => {
		const months = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];

		const baseRevenue = 7500000; // RM 7.5M base monthly revenue
		const peakMonths = [3, 9]; // April (index 3), October (index 9)
		const lowMonths = [1]; // February (index 1)

		const monthData = months.map((month, index) => {
			// Apply seasonal multipliers
			let seasonalMultiplier = 1.0;
			if (peakMonths.includes(index)) {
				seasonalMultiplier = 1.25; // 25% higher for peak months
			} else if (lowMonths.includes(index)) {
				seasonalMultiplier = 0.8; // 20% lower for low months
			} else if (index === 11) {
				seasonalMultiplier = 1.15; // December holiday season
			} else if (index === 6 || index === 7) {
				seasonalMultiplier = 0.9; // Summer slowdown
			}

			const totalRevenue = Math.round(baseRevenue * seasonalMultiplier);

			// Channel breakdown (TV dominates, Radio stable, BES smaller)
			const tvRevenue = Math.round(totalRevenue * 0.56);
			const radioRevenue = Math.round(totalRevenue * 0.38);
			const besRevenue = totalRevenue - tvRevenue - radioRevenue;

			// Year-over-year growth (varies by seasonality)
			const yoyGrowth = peakMonths.includes(index)
				? 18.5
				: lowMonths.includes(index)
				? -5.2
				: 12.3;

			return {
				month,
				monthIndex: index,
				totalRevenue,
				channels: {
					TV: tvRevenue,
					RADIO: radioRevenue,
					BES: besRevenue,
				},
				yearOverYearGrowth: yoyGrowth,
				isPeakMonth: peakMonths.includes(index),
				isLowMonth: lowMonths.includes(index),
				forecastAccuracy: 85 + Math.random() * 10, // 85-95% accuracy
			};
		});

		return {
			months: monthData,
			metadata: {
				year: new Date().getFullYear(),
				currency: "MYR",
				averageMonthlyRevenue: Math.round(
					monthData.reduce((sum, m) => sum + m.totalRevenue, 0) / 12
				),
				peakMonths: ["April", "October"],
				lowMonths: ["February"],
			},
		};
	}, []);

	const seasonalData = data || mockData;

	// Helper function to get color intensity based on revenue
	const getColorIntensity = (revenue: number) => {
		const maxRevenue = Math.max(
			...seasonalData.months.map((m) => m.totalRevenue)
		);
		const minRevenue = Math.min(
			...seasonalData.months.map((m) => m.totalRevenue)
		);
		const normalized = (revenue - minRevenue) / (maxRevenue - minRevenue);

		if (normalized > 0.8) return "bg-amber-600 hover:bg-amber-700 text-white";
		if (normalized > 0.6) return "bg-stone-600 hover:bg-stone-700 text-white";
		if (normalized > 0.4) return "bg-lime-600 hover:bg-lime-700 text-white";
		if (normalized > 0.2) return "bg-teal-600 hover:bg-teal-700 text-white";
		return "bg-cyan-600 hover:bg-cyan-700 text-white";
	};

	// Format currency
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-MY", {
			style: "currency",
			currency: "MYR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	};

	// Custom tooltip content
	const MonthTooltip = ({ monthData }: { monthData: SeasonalMonthData }) => (
		<div className="min-w-[280px] p-4 bg-white">
			<div className="flex items-center justify-between mb-3">
				<h4 className="font-bold text-gray-900">{monthData.month}</h4>
				<div className="flex items-center gap-2">
					{monthData.isPeakMonth && (
						<span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
							Peak Month
						</span>
					)}
					{monthData.isLowMonth && (
						<span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full font-medium">
							Low Month
						</span>
					)}
				</div>
			</div>

			<div className="space-y-2 mb-3">
				<div className="text-sm font-semibold text-gray-800">
					Total Revenue: {formatCurrency(monthData.totalRevenue)}
				</div>
				<div
					className={`text-xs font-medium ${
						monthData.yearOverYearGrowth > 0
							? "text-emerald-600"
							: "text-red-600"
					}`}
				>
					YoY Growth: {monthData.yearOverYearGrowth > 0 ? "+" : ""}
					{monthData.yearOverYearGrowth.toFixed(1)}%
				</div>
			</div>

			<div className="border-t border-gray-100 pt-3">
				<div className="text-xs font-semibold text-gray-700 mb-2">
					Channel Breakdown:
				</div>
				<div className="space-y-1">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-slate-600" />
							<span className="text-xs text-gray-600">TV</span>
						</div>
						<span className="text-xs font-medium text-gray-800">
							{formatCurrency(monthData.channels.TV)}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-teal-600" />
							<span className="text-xs text-gray-600">Radio</span>
						</div>
						<span className="text-xs font-medium text-gray-800">
							{formatCurrency(monthData.channels.RADIO)}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-lime-600" />
							<span className="text-xs text-gray-600">BES</span>
						</div>
						<span className="text-xs font-medium text-gray-800">
							{formatCurrency(monthData.channels.BES)}
						</span>
					</div>
				</div>
			</div>

			<div className="border-t border-gray-100 pt-2 mt-3">
				<div className="text-xs text-gray-500">
					Forecast Accuracy: {monthData.forecastAccuracy.toFixed(1)}%
				</div>
			</div>
		</div>
	);

	if (isLoading) {
		return (
			<Card className="w-full">
				<CardHeader className="">
					<CardTitle className="text-xl font-bold font-sans text-gray-800">
						Seasonal Revenue Forecast Calendar
					</CardTitle>
				</CardHeader>
				<CardContent className="">
					<div className="h-[400px] flex items-center justify-center">
						<div className="animate-pulse text-gray-500">
							Loading seasonal calendar data...
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="w-full">
				<CardHeader className="">
					<CardTitle className="text-xl font-bold font-sans text-gray-800">
						Seasonal Revenue Forecast Calendar
					</CardTitle>
				</CardHeader>
				<CardContent className="">
					<div className="h-[400px] flex items-center justify-center">
						<div className="text-red-500">
							Error loading seasonal calendar data: {error}
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<TooltipProvider>
			<Card className="w-full">
				<CardHeader className="pb-4">
					<CardTitle className="text-xl font-bold font-sans text-gray-800">
						Seasonal Revenue Forecast Calendar
					</CardTitle>
					<p className="text-sm text-gray-600 font-sans">
						Monthly revenue patterns showing seasonal trends and strategic
						planning opportunities
					</p>
					<div className="flex items-center gap-4 text-xs text-gray-500">
						<span>
							Average Monthly Revenue:{" "}
							{formatCurrency(seasonalData.metadata.averageMonthlyRevenue)}
						</span>
						<span>•</span>
						<span>
							Peak Months: {seasonalData.metadata.peakMonths.join(", ")}
						</span>
						<span>•</span>
						<span>Low Month: {seasonalData.metadata.lowMonths.join(", ")}</span>
					</div>
				</CardHeader>
				<CardContent className="">
					{/* Legend */}
					<div className="mb-6 flex items-center justify-center gap-6">
						<div className="flex items-center gap-2">
							<div className="w-4 h-4 rounded bg-cyan-600" />
							<span className="text-xs text-gray-600">Low</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-4 h-4 rounded bg-teal-600" />
							<span className="text-xs text-gray-600">Below Average</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-4 h-4 rounded bg-lime-600" />
							<span className="text-xs text-gray-600">Average</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-4 h-4 rounded bg-stone-600" />
							<span className="text-xs text-gray-600">Above Average</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-4 h-4 rounded bg-amber-600" />
							<span className="text-xs text-gray-600">Peak</span>
						</div>
					</div>

					{/* Calendar Grid */}
					<div className="grid grid-cols-3 md:grid-cols-4 gap-4">
						{seasonalData.months.map((monthData) => (
							<Tooltip key={monthData.month}>
								<TooltipTrigger asChild>
									<div
										className={`
                      relative p-4 rounded-lg text-white cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md
                      ${getColorIntensity(monthData.totalRevenue)}
                      ${
												monthData.isPeakMonth
													? "ring-2 ring-amber-400 ring-offset-2"
													: ""
											}
                      ${
												monthData.isLowMonth
													? "ring-2 ring-cyan-400 ring-offset-2"
													: ""
											}
                    `}
									>
										{/* Month indicator */}
										<div className="text-xs font-medium opacity-90 mb-2">
											{monthData.month.substring(0, 3).toUpperCase()}
										</div>

										{/* Revenue amount */}
										<div className="text-sm font-bold mb-1">
											{formatCurrency(monthData.totalRevenue).replace(
												"RM",
												"RM "
											)}
										</div>

										{/* Growth indicator */}
										<div className="flex items-center gap-1">
											<div
												className={`w-0 h-0 border-l-4 border-r-0 border-b-4 ${
													monthData.yearOverYearGrowth > 0
														? "border-l-transparent border-b-white"
														: "border-l-transparent border-b-transparent rotate-180"
												}`}
											/>
											<span className="text-xs font-medium">
												{Math.abs(monthData.yearOverYearGrowth).toFixed(1)}%
											</span>
										</div>

										{/* Peak/Low indicators */}
										{monthData.isPeakMonth && (
											<div className="absolute top-1 right-1 w-2 h-2 bg-amber-300 rounded-full" />
										)}
										{monthData.isLowMonth && (
											<div className="absolute top-1 right-1 w-2 h-2 bg-cyan-300 rounded-full" />
										)}
									</div>
								</TooltipTrigger>
								<TooltipContent
									side="top"
									className="p-0 bg-white border border-gray-200 shadow-lg"
								>
									<MonthTooltip monthData={monthData} />
								</TooltipContent>
							</Tooltip>
						))}
					</div>

					{/* Summary Statistics */}
					<div className="mt-6 pt-4 border-t border-gray-200">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
							<div className="text-center">
								<div className="text-gray-500 text-xs mb-1">
									Peak Month Revenue
								</div>
								<div className="font-semibold text-amber-700">
									{formatCurrency(
										Math.max(
											...seasonalData.months
												.filter((m) => m.isPeakMonth)
												.map((m) => m.totalRevenue)
										)
									)}
								</div>
							</div>
							<div className="text-center">
								<div className="text-gray-500 text-xs mb-1">
									Low Month Revenue
								</div>
								<div className="font-semibold text-cyan-700">
									{formatCurrency(
										Math.min(
											...seasonalData.months
												.filter((m) => m.isLowMonth)
												.map((m) => m.totalRevenue)
										)
									)}
								</div>
							</div>
							<div className="text-center">
								<div className="text-gray-500 text-xs mb-1">
									Seasonal Variance
								</div>
								<div className="font-semibold text-gray-800">
									{(
										((Math.max(
											...seasonalData.months.map((m) => m.totalRevenue)
										) -
											Math.min(
												...seasonalData.months.map((m) => m.totalRevenue)
											)) /
											seasonalData.metadata.averageMonthlyRevenue) *
										100
									).toFixed(1)}
									%
								</div>
							</div>
							<div className="text-center">
								<div className="text-gray-500 text-xs mb-1">YoY Growth</div>
								<div className="font-semibold text-emerald-700">
									+
									{(
										seasonalData.months.reduce(
											(sum, m) => sum + m.yearOverYearGrowth,
											0
										) / 12
									).toFixed(1)}
									%
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</TooltipProvider>
	);
};

export default SeasonalRevenueCalendar;

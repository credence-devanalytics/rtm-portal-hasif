"use client";
import React from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Cell,
	ErrorBar,
	ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Top10ChannelsData } from "@/hooks/useTop10ChannelsForecasting";

interface Top10ChannelsChartProps {
	data: Top10ChannelsData;
	isLoading?: boolean;
	error?: string;
	selectedCategory?: string | null;
	onCategoryChange?: (category: string | null) => void;
}

const Top10ChannelsChart: React.FC<Top10ChannelsChartProps> = ({
	data,
	isLoading,
	error,
	selectedCategory,
	onCategoryChange,
}) => {
	if (isLoading) {
		return (
			<Card className="w-full">
				<CardHeader className="">
					<CardTitle className="text-lg font-bold font-sans">
						Top 10 Channel Revenue Forecast (by Max Range)
					</CardTitle>
				</CardHeader>
				<CardContent className="">
					<div className="h-[500px] flex items-center justify-center">
						<div className="animate-pulse text-gray-500">
							Loading top 10 channels data...
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
					<CardTitle className="text-lg font-bold font-sans">
						Top 10 Channel Revenue Forecast (by Max Range)
					</CardTitle>
				</CardHeader>
				<CardContent className="">
					<div className="h-[500px] flex items-center justify-center">
						<div className="text-red-500">
							Error loading top 10 channels data: {error}
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Color palette for categories
	const categoryColors = {
		TV: "#475569", // slate-600
		RADIO: "#0d9488", // teal-600
		BES: "#ca8a04", // amber-600
	};

	// Handle empty data case
	if (data.channels.length === 0) {
		return (
			<Card className="w-full">
				<CardHeader className="pb-4">
					<CardTitle className="text-xl font-bold font-sans text-gray-800">
						Top 10 Channel Revenue Forecast (by Max Range)
					</CardTitle>
					<p className="text-sm text-gray-600 font-sans">
						Channels sorted by maximum forecast range (upside potential),
						highlighting high-growth investment opportunities
					</p>
					<div className="flex items-center gap-4 text-xs text-gray-500">
						<span>No channels found</span>
					</div>
				</CardHeader>
				<CardContent className="">
					<div className="h-[500px] flex items-center justify-center">
						<div className="text-gray-500 text-center">
							<div className="text-lg font-medium mb-2">No data available</div>
							<div className="text-sm">
								{selectedCategory
									? `No ${selectedCategory} sub-channels found in the data`
									: "No sub-channels data available"}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Prepare chart data (now using server-side filtered data)
	const chartData = data.channels.map((channel) => ({
		...channel,
		displayName:
			channel.channel.length > 12
				? channel.channel.substring(0, 12) + "..."
				: channel.channel,
		categoryColor: categoryColors[channel.category],
		forecastMin: channel.confidenceInterval.lower,
		forecastMax: channel.confidenceInterval.upper,
		errorMargin: [
			channel.forecastRevenue - channel.confidenceInterval.lower,
			channel.confidenceInterval.upper - channel.forecastRevenue,
		],
	}));

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-MY", {
			style: "currency",
			currency: "MYR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	};

	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="min-w-[350px] p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
					{/* Header */}
					<div className="flex items-center justify-between mb-3">
						<h4 className="font-bold text-gray-900">Rank #{data.rank}</h4>
						<div className="flex items-center gap-2">
							<span
								className="px-2 py-1 text-xs rounded-full font-medium text-white"
								style={{ backgroundColor: data.categoryColor }}
							>
								{data.category}
							</span>
						</div>
					</div>

					{/* Channel Name */}
					<div className="mb-3">
						<div className="text-lg font-semibold text-gray-800">
							{data.channel}
						</div>
					</div>

					{/* Revenue Details */}
					<div className="space-y-2 mb-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div
									className="w-3 h-3 rounded"
									style={{ backgroundColor: data.categoryColor }}
								/>
								<span className="text-sm text-gray-600">
									2024 Revenue (Actual):
								</span>
							</div>
							<span className="text-sm font-semibold text-gray-800">
								{formatCurrency(data.currentRevenue)}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div
									className="w-3 h-3 rounded"
									style={{ backgroundColor: data.categoryColor, opacity: 0.6 }}
								/>
								<span className="text-sm text-gray-600">
									2025 Forecast (Projected):
								</span>
							</div>
							<span className="text-sm font-semibold text-blue-700">
								{formatCurrency(data.forecastRevenue)}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Forecast Range:</span>
							<span className="text-xs text-gray-500">
								{formatCurrency(data.forecastMin)} -{" "}
								{formatCurrency(data.forecastMax)}
							</span>
						</div>
					</div>

					{/* Growth Rate */}
					<div className="border-t border-gray-100 pt-3">
						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-600">Growth Rate:</span>
							<div className="flex items-center gap-1">
								<div
									className={`w-0 h-0 border-l-4 border-r-0 border-b-4 ${
										data.growthRate > 0
											? "border-l-transparent border-b-emerald-600"
											: "border-l-transparent border-b-red-600 rotate-180"
									}`}
								/>
								<span
									className={`text-sm font-semibold ${
										data.growthRate > 0 ? "text-emerald-600" : "text-red-600"
									}`}
								>
									{data.growthRate > 0 ? "+" : ""}
									{data.growthRate.toFixed(1)}%
								</span>
							</div>
						</div>
					</div>

					{/* Historical Trend */}
					<div className="border-t border-gray-100 pt-3 mt-3">
						<div className="text-xs text-gray-500 mb-2">Historical Trend:</div>
						<div className="flex gap-4 text-xs">
							<div>
								<span className="text-gray-500">2022:</span>
								<span className="ml-1 font-medium">
									{formatCurrency(data.historical[0]).replace("RM", "RM ")}
								</span>
							</div>
							<div>
								<span className="text-gray-500">2023:</span>
								<span className="ml-1 font-medium">
									{formatCurrency(data.historical[1]).replace("RM", "RM ")}
								</span>
							</div>
							<div>
								<span className="text-gray-500">2024:</span>
								<span className="ml-1 font-medium">
									{formatCurrency(data.historical[2]).replace("RM", "RM ")}
								</span>
							</div>
						</div>
					</div>
				</div>
			);
		}
		return null;
	};

	const CustomYAxisTick = (props: any) => {
		const { x, y, payload } = props;

		return (
			<g transform={`translate(${x},${y})`}>
				<text
					x={-5}
					y={0}
					textAnchor="end"
					fill="#374151"
					className="text-sm"
					fontSize={12}
				>
					{payload.value.length > 15
						? payload.value.substring(0, 15) + "..."
						: payload.value}
				</text>
				{/* {channelData && (
					<circle cx={-180} cy={0} r={3} fill={channelData.categoryColor} />
				)} */}
			</g>
		);
	};

	return (
		<Card className="w-full">
			<CardHeader className="pb-4">
				<CardTitle className="text-xl font-bold font-sans text-gray-800">
					Top 10 Channel Revenue Forecast
				</CardTitle>
				<p className="text-sm text-gray-600 font-sans">
					Channels sorted by maximum forecast range (upside potential),
					highlighting high-growth investment opportunities
				</p>
				<div className="flex items-center gap-4 text-xs text-gray-500">
					<span>
						Top 3 Concentration: {data.summary.top3Concentration.toFixed(1)}%
					</span>
					<span>•</span>
					<span>
						Avg Growth Rate: {data.summary.averageGrowthRate.toFixed(1)}%
					</span>
					<span>•</span>
					<span>Total Channels Analyzed: {data.metadata.totalChannels}</span>
				</div>
			</CardHeader>
			<CardContent className="">
				<ResponsiveContainer width="100%" height={500}>
					<BarChart
						data={chartData}
						layout="vertical"
						margin={{
							top: 20,
							right: 80,
							bottom: 20,
							left: 20,
						}}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
						<XAxis
							type="number"
							tick={{ fontSize: 12 }}
							tickFormatter={formatCurrency}
							domain={[0, "dataMax"]}
						/>
						<YAxis
							type="category"
							dataKey="channel"
							tick={<CustomYAxisTick />}
							width={180}
						/>
						<Tooltip
							content={<CustomTooltip />}
							wrapperStyle={{ outline: "none" }}
						/>

						{/* Current Revenue Bars */}
						<Bar dataKey="currentRevenue" fill="#8884d8" name="2024 Revenue">
							{chartData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={entry.categoryColor} />
							))}
						</Bar>

						{/* Forecast Revenue Bars */}
						<Bar
							dataKey="forecastRevenue"
							fill="#82ca9d"
							name="2025 Forecast"
							opacity={0.7}
						>
							{chartData.map((entry, index) => (
								<Cell
									key={`forecast-cell-${index}`}
									fill={entry.categoryColor}
								/>
							))}
						</Bar>

						{/* Error Bars for Forecast */}
						<Bar
							dataKey="forecastRevenue"
							name="Forecast Range"
							strokeWidth={2}
							stroke="#666"
							fill="none"
						>
							<ErrorBar
								dataKey="errorMargin"
								width={4}
								stroke="#666"
								strokeWidth={1.5}
							/>
						</Bar>

						{/* Reference line for average of all channels */}
						<ReferenceLine
							x={data.summary.averageAllChannelsRevenue}
							stroke="#ff7300"
							strokeDasharray="5 5"
							strokeWidth={1}
							label={{ value: "All Channels Average", position: "top" }}
						/>
					</BarChart>
				</ResponsiveContainer>

				{/* Interactive Legend */}
				<div className="mt-6 space-y-4">
					<div className="flex items-center justify-center gap-6 text-sm">
						<div
							className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition-all ${
								selectedCategory === null
									? "bg-gray-100 border border-gray-300"
									: "hover:bg-gray-50"
							}`}
							onClick={() => onCategoryChange?.(null)}
						>
							<div className="w-4 h-4 rounded bg-gray-400" />
							<span className="text-gray-700 font-medium">All Channels</span>
							<span className="text-xs text-gray-500">(10)</span>
						</div>
						{Object.entries(categoryColors).map(([category, color]) => {
							// BES category is always disabled since there are no BES sub-channels
							const isDisabled = category === "BES";
							const count = data.channels.filter((c) => c.category === category).length;

							return (
								<div
									key={category}
									className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
										isDisabled
											? "opacity-50 cursor-not-allowed"
											: selectedCategory === category
											? "bg-gray-100 border border-gray-300 cursor-pointer hover:bg-gray-50"
											: "cursor-pointer hover:bg-gray-50"
									}`}
									onClick={() => {
										if (!isDisabled) {
											onCategoryChange?.(
												selectedCategory === category ? null : category
											);
										}
									}}
								>
									<div
										className="w-4 h-4 rounded"
										style={{ backgroundColor: color }}
									/>
									<span className="text-gray-700 font-medium">{category}</span>
									<span className="text-xs text-gray-500">
										{isDisabled ? "(0)" : `(${count})`}
									</span>
								</div>
							);
						})}
					</div>
					<div className="flex items-center justify-center gap-6 text-sm">
						<div className="flex items-center gap-2">
							<div className="w-8 h-4 border-2 border-gray-400 bg-gray-200 opacity-70" />
							<span className="text-gray-600">Confidence Range</span>
						</div>
						{selectedCategory && (
							<div className="text-xs text-gray-500">
								Showing {data.channels.length} {selectedCategory} channel
								{data.channels.length !== 1 ? "s" : ""}
							</div>
						)}
					</div>
				</div>

				{/* Summary Statistics */}
				<div className="mt-6 pt-4 border-t border-gray-200">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
						<div className="text-center">
							<div className="text-gray-500 text-xs mb-1">
								{selectedCategory ? `${selectedCategory} ` : "Total "}Revenue
							</div>
							<div className="font-semibold text-gray-800">
								{formatCurrency(
									data.channels.reduce((sum, ch) => sum + ch.currentRevenue, 0)
								)}
							</div>
						</div>
						<div className="text-center">
							<div className="text-gray-500 text-xs mb-1">Top Channel</div>
							<div className="font-semibold text-gray-800">
								{data.channels[0]?.channel || "N/A"}
							</div>
						</div>
						<div className="text-center">
							<div className="text-gray-500 text-xs mb-1">Avg Growth Rate</div>
							<div className="font-semibold text-emerald-700">
								{data.channels.length > 0
									? `${(
											data.channels.reduce((sum, ch) => sum + ch.growthRate, 0) /
											data.channels.length
									  ).toFixed(1)}%`
									: "N/A"}
							</div>
						</div>
						<div className="text-center">
							<div className="text-gray-500 text-xs mb-1">All Channels Avg</div>
							<div className="font-semibold text-orange-700">
								{formatCurrency(data.summary.averageAllChannelsRevenue)}
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default Top10ChannelsChart;

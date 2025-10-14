"use client";
import React from "react";
import {
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Area,
	ComposedChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForecastingData } from "@/hooks/useMarketingForecasting";

interface ForecastingChartProps {
	data: ForecastingData;
	isLoading?: boolean;
	error?: string;
}

const ForecastingChart: React.FC<ForecastingChartProps> = ({
	data,
	isLoading,
	error,
}) => {
	if (isLoading) {
		return (
			<Card className="w-full">
				<CardHeader className="">
					<CardTitle className="text-lg font-bold font-sans">
						Marketing Revenue Forecasting
					</CardTitle>
				</CardHeader>
				<CardContent className="">
					<div className="h-[400px] flex items-center justify-center">
						<div className="animate-pulse text-gray-500">
							Loading forecasting data...
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
						Marketing Revenue Forecasting
					</CardTitle>
				</CardHeader>
				<CardContent className="">
					<div className="h-[400px] flex items-center justify-center">
						<div className="text-red-500">
							Error loading forecasting data: {error}
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Transform data for chart
	const chartData = [
		{
			year: "2022",
			...Object.keys(data.channels).reduce((acc, channel) => {
				const channelData = data.channels[channel];
				acc[channel] = channelData?.historical[0] || 0;
				acc[`${channel}_forecast`] = null;
				acc[`${channel}_upper`] = null;
				acc[`${channel}_lower`] = null;
				return acc;
			}, {} as any),
		},
		{
			year: "2023",
			...Object.keys(data.channels).reduce((acc, channel) => {
				const channelData = data.channels[channel];
				acc[channel] = channelData?.historical[1] || 0;
				acc[`${channel}_forecast`] = null;
				acc[`${channel}_upper`] = null;
				acc[`${channel}_lower`] = null;
				return acc;
			}, {} as any),
		},
		{
			year: "2024",
			...Object.keys(data.channels).reduce((acc, channel) => {
				const channelData = data.channels[channel];
				const historicalValue = channelData?.historical[2] || 0;
				acc[channel] = historicalValue;
				acc[`${channel}_forecast`] = historicalValue; // Use historical value for connection
				acc[`${channel}_upper`] = channelData?.confidenceInterval?.upper || 0;
				acc[`${channel}_lower`] = channelData?.confidenceInterval?.lower || 0;
				return acc;
			}, {} as any),
		},
		{
			year: "2025 (Forecast)",
			...Object.keys(data.channels).reduce((acc, channel) => {
				const channelData = data.channels[channel];
				acc[channel] = null;
				acc[`${channel}_forecast`] = channelData?.forecast || 0;
				acc[`${channel}_upper`] = channelData?.confidenceInterval?.upper || 0;
				acc[`${channel}_lower`] = channelData?.confidenceInterval?.lower || 0;
				return acc;
			}, {} as any),
		},
	];

	// Color palette for channels
	const channelColors = {
		TV: "#3b82f6", // Blue
		RADIO: "#ef4444", // Red
		BES: "#10b981", // Green
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-MY", {
			style: "currency",
			currency: "MYR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	};

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const isForecastYear = label.includes("2025");

			return (
				<div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 min-w-[200px] max-w-xs">
					{/* Header */}
					<div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
						<div className={`w-2 h-2 rounded-full ${isForecastYear ? 'bg-blue-500' : 'bg-green-500'}`} />
						<p className="font-bold text-gray-900 text-sm">{label}</p>
					</div>

					{/* Channels */}
					<div className="space-y-2">
						{Object.keys(data.channels).map((channel) => {
							const channelData = data.channels[channel];
							const color = channelColors[channel as keyof typeof channelColors];

							// Get the actual value for this channel and year
							let value = 0;
							let isHistorical = true;

							if (label.includes("2022")) {
								value = channelData?.historical[0] || 0;
							} else if (label.includes("2023")) {
								value = channelData?.historical[1] || 0;
							} else if (label.includes("2024")) {
								value = channelData?.historical[2] || 0;
							} else if (label.includes("2025")) {
								value = channelData?.forecast || 0;
								isHistorical = false;
							}

							if (value === 0) return null;

							return (
								<div key={channel} className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div
											className="w-2 h-2 rounded-full"
											style={{ backgroundColor: color }}
										/>
										<div>
											<div className="flex items-center gap-1">
												<span className="font-medium text-gray-800 text-xs">{channel}</span>
												{!isHistorical && (
													<span className="px-1 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">F</span>
												)}
											</div>
											<div className="font-semibold text-gray-900 text-sm">
												{formatCurrency(value)}
											</div>
											{!isHistorical && channelData && (
												<div className="text-xs text-gray-500">
													<span className={channelData.growthRate > 0 ? 'text-green-600' : 'text-red-600'}>
														{channelData.growthRate > 0 ? '+' : ''}{channelData.growthRate.toFixed(1)}%
													</span>
												</div>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			);
		}
		return null;
	};

	const CustomLegend = () => {
		return (
			<div className="flex flex-wrap items-center justify-center gap-6 pt-4">
				{Object.keys(data.channels).map((channel) => (
					<div key={channel} className="flex items-center gap-2">
						<div
							className="w-4 h-4 rounded-full"
							style={{
								backgroundColor:
									channelColors[channel as keyof typeof channelColors],
							}}
						/>
						<span className="text-sm font-medium text-gray-700">{channel}</span>
					</div>
				))}
			</div>
		);
	};

	return (
		<Card className="w-full">
			<CardHeader className="pb-4">
				<CardTitle className="text-xl font-bold font-sans text-gray-800">
					Marketing Revenue Forecasting
				</CardTitle>
				<p className="text-sm text-gray-600 font-sans">
					Historical performance (2022-2024) and forecast projections (2025) for
					TV, Radio, and BES channels
				</p>
				<div className="flex items-center gap-4 text-xs text-gray-500">
					<span>
						Overall Growth Rate: {data.summary.overallGrowthRate.toFixed(1)}%
					</span>
					<span>•</span>
					<span>
						2025 Total Revenue: {data.summary.formattedRevenue.forecast2025}
					</span>
				</div>
			</CardHeader>
			<CardContent className="">
				<ResponsiveContainer width="100%" height={450}>
					<ComposedChart
						data={chartData}
						margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
						<XAxis
							dataKey="year"
							tick={{ fontSize: 14 }}
							angle={-45}
							textAnchor="end"
							height={80}
						/>
						<YAxis
							tick={{ fontSize: 14 }}
							tickFormatter={formatCurrency}
							domain={[0, "dataMax"]}
							padding={{ top: 20, bottom: 20 }}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Legend content={<CustomLegend />} />

						{/* Confidence intervals (areas) */}
						{Object.keys(data.channels).map((channel) => {
							const channelData = data.channels[channel];
							if (!channelData) return null;

							const color =
								channelColors[channel as keyof typeof channelColors];

							return (
								<Area
									key={`${channel}_confidence`}
									type="monotone"
									dataKey={`${channel}_upper`}
									stroke="none"
									fill={color}
									fillOpacity={0.15}
								/>
							);
						})}

						{/* Historical lines (solid) - 2022-2024 */}
						{Object.keys(data.channels).map((channel) => {
							const color =
								channelColors[channel as keyof typeof channelColors];
							return (
								<Line
									key={channel}
									type="linear"
									dataKey={channel}
									stroke={color}
									strokeWidth={3}
									dot={{
										fill: color,
										strokeWidth: 2,
										r: 5,
									}}
									activeDot={{
										r: 7,
										stroke: color,
										strokeWidth: 2,
									}}
								/>
							);
						})}

						{/* Forecast lines (dashed) - 2024-2025 */}
						{Object.keys(data.channels).map((channel) => {
							const color =
								channelColors[channel as keyof typeof channelColors];
							return (
								<Line
									key={`${channel}_forecast`}
									type="linear"
									dataKey={`${channel}_forecast`}
									stroke={color}
									strokeWidth={3}
									strokeDasharray="8 4"
									dot={false}
									activeDot={false}
								/>
							);
						})}
					</ComposedChart>
				</ResponsiveContainer>

				{/* Summary Statistics */}
				<div className="mt-6 pt-4 border-t border-gray-200">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
						<div className="text-center">
							<div className="text-gray-500 text-xs mb-1">2022 Revenue</div>
							<div className="font-semibold text-gray-800">
								{data.summary.formattedRevenue["2022"]}
							</div>
						</div>
						<div className="text-center">
							<div className="text-gray-500 text-xs mb-1">2023 Revenue</div>
							<div className="font-semibold text-gray-800">
								{data.summary.formattedRevenue["2023"]}
							</div>
						</div>
						<div className="text-center">
							<div className="text-gray-500 text-xs mb-1">2024 Revenue</div>
							<div className="font-semibold text-gray-800">
								{data.summary.formattedRevenue["2024"]}
							</div>
						</div>
						<div className="text-center">
							<div className="text-gray-500 text-xs mb-1">2025 Forecast</div>
							<div className="font-semibold text-blue-600">
								{data.summary.formattedRevenue.forecast2025}
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default ForecastingChart;

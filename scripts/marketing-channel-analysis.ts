#!/usr/bin/env tsx

/**
 * Marketing Channel Data Analysis Script
 *
 * This script analyzes marketing channel data by year and month to understand
 * data patterns, unique values, and trends for forecasting chart development.
 *
 * Usage: npm run analyze:marketing
 */

import { config } from "dotenv";
config();

import { getDb } from "../src/lib/db";
import {
	marketingChannelByyear as marketingChannelByYear,
	marketingChannelBymonth as marketingChannelByMonth,
} from "../drizzle/schema";
import { eq, and, sql, desc, asc } from "drizzle-orm";

interface ChannelData {
	saluran: string;
	year: number;
	month?: string;
	value: number;
	reportType: string;
	reportTitle: string;
}

interface Statistics {
	totalRevenue: number;
	averageRevenue: number;
	minRevenue: number;
	maxRevenue: number;
	channelCount: number;
	yearOverYearGrowth: number;
	topChannel: string;
	bottomChannel: string;
}

class MarketingChannelAnalyzer {
	private db = getDb();

	async analyzeYearlyData(): Promise<void> {
		console.log("\n🔍 ANALYZING YEARLY MARKETING CHANNEL DATA");
		console.log("=".repeat(60));

		try {
			// Get all unique years and report types
			const yearsQuery = await this.db
				.selectDistinct({ year: marketingChannelByYear.year })
				.from(marketingChannelByYear)
				.orderBy(desc(marketingChannelByYear.year));

			const reportTypesQuery = await this.db
				.selectDistinct({ reportType: marketingChannelByYear.reportType })
				.from(marketingChannelByYear);

			console.log("\n📊 Data Overview:");
			console.log("Years available:", yearsQuery.map((y) => y.year).join(", "));
			console.log(
				"Report types:",
				reportTypesQuery.map((r) => r.reportType).join(", ")
			);

			// Analyze each report type
			for (const { reportType } of reportTypesQuery) {
				console.log(`\n📈 Analyzing Report Type: ${reportType}`);
				console.log("-".repeat(40));

				await this.analyzeReportTypeByYear(reportType);
			}

			// Channel analysis
			await this.analyzeChannelPerformance();

			// Generate summary statistics
			await this.generateYearlyStatistics();
		} catch (error) {
			console.error("❌ Error analyzing yearly data:", error);
		}
	}

	private async analyzeReportTypeByYear(reportType: string): Promise<void> {
		const data = await this.db
			.select()
			.from(marketingChannelByYear)
			.where(eq(marketingChannelByYear.reportType, reportType))
			.orderBy(
				asc(marketingChannelByYear.year),
				asc(marketingChannelByYear.saluran)
			);

		if (data.length === 0) {
			console.log(`No data found for report type: ${reportType}`);
			return;
		}

		// Group by year
		const yearlyData = data.reduce((acc, item) => {
			if (!acc[item.year]) {
				acc[item.year] = [];
			}
			acc[item.year].push({
				saluran: item.saluran,
				value: parseFloat(item.value) || 0,
				reportTitle: item.report_title,
			});
			return acc;
		}, {} as Record<number, Array<{ saluran: string; value: number; reportTitle: string }>>);

		// Display yearly summary
		Object.keys(yearlyData)
			.sort()
			.forEach((year) => {
				const yearData = yearlyData[parseInt(year)];
				const total = yearData.reduce((sum, item) => sum + item.value, 0);
				const channels = yearData.filter((item) => item.value > 0).length;

				console.log(
					`  ${year}: RM ${total.toLocaleString()} | ${channels} active channels`
				);
			});

		// Data saved to console for analysis
	}

	private async analyzeChannelPerformance(): Promise<void> {
		console.log("\n🎯 CHANNEL PERFORMANCE ANALYSIS");
		console.log("-".repeat(40));

		const channelQuery = await this.db
			.select({
				saluran: marketingChannelByYear.saluran,
				totalRevenue:
					sql<number>`SUM(CAST(${marketingChannelByYear.value} AS DECIMAL))`.mapWith(
						Number
					),
				yearCount:
					sql<number>`COUNT(DISTINCT ${marketingChannelByYear.year})`.mapWith(
						Number
					),
				avgRevenue:
					sql<number>`AVG(CAST(${marketingChannelByYear.value} AS DECIMAL))`.mapWith(
						Number
					),
			})
			.from(marketingChannelByYear)
			.groupBy(marketingChannelByYear.saluran)
			.orderBy(
				desc(sql`SUM(CAST(${marketingChannelByYear.value} AS DECIMAL))`)
			);

		console.log("\nTop 10 Channels by Total Revenue:");
		channelQuery.slice(0, 10).forEach((channel, index) => {
			console.log(
				`${(index + 1).toString().padStart(2)}. ${channel.saluran.padEnd(
					20
				)} | RM ${channel.totalRevenue.toLocaleString()} | Avg: RM ${channel.avgRevenue.toFixed(
					0
				)} | Years: ${channel.yearCount}`
			);
		});

		// Save channel performance data
		// Channel performance saved to console for analysis
	}

	private async generateYearlyStatistics(): Promise<void> {
		console.log("\n📊 GENERATING YEARLY STATISTICS");
		console.log("-".repeat(40));

		const years = [2022, 2023, 2024];
		const stats: Record<number, Statistics> = {};

		for (const year of years) {
			const yearData = await this.db
				.select({
					value:
						sql<number>`CAST(${marketingChannelByYear.value} AS DECIMAL)`.mapWith(
							Number
						),
				})
				.from(marketingChannelByYear)
				.where(eq(marketingChannelByYear.year, year));

			const values = yearData.map((d) => d.value).filter((v) => v > 0);
			const totalRevenue = values.reduce((sum, val) => sum + val, 0);

			stats[year] = {
				totalRevenue,
				averageRevenue: values.length > 0 ? totalRevenue / values.length : 0,
				minRevenue: values.length > 0 ? Math.min(...values) : 0,
				maxRevenue: values.length > 0 ? Math.max(...values) : 0,
				channelCount: values.length,
				yearOverYearGrowth: 0, // Will calculate below
				topChannel: "",
				bottomChannel: "",
			};

			console.log(`${year}:`);
			console.log(`  Total Revenue: RM ${totalRevenue.toLocaleString()}`);
			console.log(`  Active Channels: ${values.length}`);
			console.log(
				`  Average Revenue: RM ${stats[year].averageRevenue.toFixed(0)}`
			);
			console.log(
				`  Range: RM ${stats[year].minRevenue.toLocaleString()} - RM ${stats[
					year
				].maxRevenue.toLocaleString()}`
			);
		}

		// Calculate year-over-year growth
		if (stats[2022] && stats[2023]) {
			stats[2023].yearOverYearGrowth =
				((stats[2023].totalRevenue - stats[2022].totalRevenue) /
					stats[2022].totalRevenue) *
				100;
		}
		if (stats[2023] && stats[2024]) {
			stats[2024].yearOverYearGrowth =
				((stats[2024].totalRevenue - stats[2023].totalRevenue) /
					stats[2023].totalRevenue) *
				100;
		}

		console.log("\n📈 Year-over-Year Growth:");
		console.log(
			`2022-2023: ${stats[2023]?.yearOverYearGrowth.toFixed(1) || "N/A"}%`
		);
		console.log(
			`2023-2024: ${stats[2024]?.yearOverYearGrowth.toFixed(1) || "N/A"}%`
		);

		// Statistics displayed in console for analysis
	}

	async analyzeMonthlyData(): Promise<void> {
		console.log("\n🔍 ANALYZING MONTHLY MARKETING CHANNEL DATA");
		console.log("=".repeat(60));

		try {
			// Get available years and months for monthly data
			const yearsQuery = await this.db
				.selectDistinct({ year: marketingChannelByMonth.year })
				.from(marketingChannelByMonth)
				.orderBy(desc(marketingChannelByMonth.year));

			const monthsQuery = await this.db
				.selectDistinct({ month: marketingChannelByMonth.month })
				.from(marketingChannelByMonth)
				.orderBy(asc(marketingChannelByMonth.month));

			console.log("\n📊 Monthly Data Overview:");
			console.log("Years available:", yearsQuery.map((y) => y.year).join(", "));
			console.log(
				"Months available:",
				monthsQuery.map((m) => m.month).join(", ")
			);

			// Analyze monthly trends
			await this.analyzeMonthlyTrends();

			// Seasonal analysis
			await this.analyzeSeasonalPatterns();
		} catch (error) {
			console.error("❌ Error analyzing monthly data:", error);
		}
	}

	private async analyzeMonthlyTrends(): Promise<void> {
		console.log("\n📈 MONTHLY TRENDS ANALYSIS");
		console.log("-".repeat(40));

		const monthlyData = await this.db
			.select({
				year: marketingChannelByMonth.year,
				month: marketingChannelByMonth.month,
				totalRevenue:
					sql<number>`SUM(CAST(${marketingChannelByMonth.value} AS DECIMAL))`.mapWith(
						Number
					),
				channelCount:
					sql<number>`COUNT(DISTINCT ${marketingChannelByMonth.saluran})`.mapWith(
						Number
					),
			})
			.from(marketingChannelByMonth)
			.groupBy(marketingChannelByMonth.year, marketingChannelByMonth.month)
			.orderBy(
				asc(marketingChannelByMonth.year),
				asc(marketingChannelByMonth.month)
			);

		// Group by year for better visualization
		const yearlyMonthlyData = monthlyData.reduce((acc, item) => {
			if (!acc[item.year]) {
				acc[item.year] = [];
			}
			acc[item.year].push(item);
			return acc;
		}, {} as Record<number, Array<{ month: string; totalRevenue: number; channelCount: number }>>);

		Object.keys(yearlyMonthlyData)
			.sort()
			.forEach((year) => {
				console.log(`\n${year} Monthly Revenue:`);
				const months = yearlyMonthlyData[parseInt(year)];

				months.forEach((month) => {
					console.log(
						`  ${month.month.padEnd(
							10
						)}: RM ${month.totalRevenue.toLocaleString()} | ${
							month.channelCount
						} channels`
					);
				});

				const yearTotal = months.reduce(
					(sum, month) => sum + month.totalRevenue,
					0
				);
				const monthAvg = yearTotal / months.length;
				console.log(
					`  Year Total: RM ${yearTotal.toLocaleString()} | Monthly Avg: RM ${monthAvg.toFixed(
						0
					)}`
				);
			});

		// Monthly trends displayed in console for analysis
	}

	private async analyzeSeasonalPatterns(): Promise<void> {
		console.log("\n🌊 SEASONAL PATTERN ANALYSIS");
		console.log("-".repeat(40));

		// Get all monthly data across years
		const allMonthlyData = await this.db
			.select({
				month: marketingChannelByMonth.month,
				value:
					sql<number>`CAST(${marketingChannelByMonth.value} AS DECIMAL)`.mapWith(
						Number
					),
				year: marketingChannelByMonth.year,
			})
			.from(marketingChannelByMonth);

		// Group by month across all years
		const monthlyPatterns = allMonthlyData.reduce((acc, item) => {
			if (!acc[item.month]) {
				acc[item.month] = [];
			}
			acc[item.month].push(item.value);
			return acc;
		}, {} as Record<string, number[]>);

		console.log("\nAverage Monthly Revenue (All Years):");

		const monthStats = Object.entries(monthlyPatterns)
			.map(([month, values]) => ({
				month,
				total: values.reduce((sum, val) => sum + val, 0),
				average: values.reduce((sum, val) => sum + val, 0) / values.length,
				min: Math.min(...values),
				max: Math.max(...values),
				count: values.length,
			}))
			.sort((a, b) => b.average - a.average);

		monthStats.forEach((stat, index) => {
			console.log(
				`${(index + 1).toString().padStart(2)}. ${stat.month.padEnd(
					10
				)} | Avg: RM ${stat.average.toFixed(
					0
				)} | Range: RM ${stat.min.toLocaleString()} - RM ${stat.max.toLocaleString()}`
			);
		});

		// Seasonal patterns displayed in console for analysis
	}

	async analyzeUniqueValues(): Promise<void> {
		console.log("\n🔍 ANALYZING UNIQUE VALUES AND DATA PATTERNS");
		console.log("=".repeat(60));

		// Unique channels (saluran)
		const uniqueChannels = await this.db
			.selectDistinct({ saluran: marketingChannelByYear.saluran })
			.from(marketingChannelByYear)
			.orderBy(asc(marketingChannelByYear.saluran));

		console.log(`\n📺 Unique Channels (${uniqueChannels.length}):`);
		uniqueChannels.forEach((channel, index) => {
			console.log(`${(index + 1).toString().padStart(2)}. ${channel.saluran}`);
		});

		// Unique report types and titles
		const reportTypes = await this.db
			.selectDistinct({
				reportType: marketingChannelByYear.reportType,
				reportTitle: marketingChannelByYear.reportTitle,
			})
			.from(marketingChannelByYear);

		console.log(`\n📋 Report Types and Titles (${reportTypes.length}):`);
		const groupedReports = reportTypes.reduce((acc, item) => {
			if (!acc[item.reportType]) {
				acc[item.reportType] = [];
			}
			acc[item.reportType].push(item.reportTitle);
			return acc;
		}, {} as Record<string, string[]>);

		Object.entries(groupedReports).forEach(([type, titles]) => {
			console.log(`\n${type}:`);
			titles.forEach((title, index) => {
				console.log(`  ${index + 1}. ${title}`);
			});
		});

		// Unique values analysis displayed in console for analysis
	}

	async run(): Promise<void> {
		console.log("🚀 MARKETING CHANNEL DATA ANALYSIS");
		console.log("=".repeat(60));
		console.log(`Started at: ${new Date().toISOString()}`);

		try {
			await this.analyzeUniqueValues();
			await this.analyzeYearlyData();
			await this.analyzeMonthlyData();

			console.log("\n✅ ANALYSIS COMPLETE");
			console.log("=".repeat(60));
			console.log(`Analysis results displayed above`);
			console.log(`Completed at: ${new Date().toISOString()}`);
		} catch (error) {
			console.error("❌ Analysis failed:", error);
			process.exit(1);
		}
	}
}

// Run the analysis
const analyzer = new MarketingChannelAnalyzer();
analyzer.run().catch(console.error);

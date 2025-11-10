"use client";
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  BarChart3,
  Users,
  Activity,
  Zap,
  Download,
  RefreshCw,
} from "lucide-react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { useMarketingData } from "@/hooks/useMarketingData";
import { useTVMonthlyData } from "@/hooks/useTVMonthlyData";
import { useMarketingTable2Data } from "@/hooks/useMarketingTable2Data";
import { useRadioMonthlyData } from "@/hooks/useRadioMonthlyData";
import { useRadioChannelsData } from "@/hooks/useRadioChannelsData";
import MarketingIncomeComparisonChart from "@/components/Marketing/MarketingIncomeComparisonChart";
import MarketingPerformanceTable from "@/components/Marketing/MarketingPerformanceTable";
import MarketingChannelBreakdownTable from "@/components/Marketing/MarketingChannelBreakdownTable";
import TVMonthlyPerformanceChart from "@/components/Marketing/TVMonthlyPerformanceChart";
import RadioMonthlyPerformanceChart from "@/components/Marketing/RadioMonthlyPerformanceChart";
import RadioChannelBreakdownTable from "@/components/Marketing/RadioChannelBreakdownTable";
import Header from "@/components/Header";

const MarketingDashboard = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  // Year options for Marketing data (2022, 2023, 2024)
  const yearOptions = useMemo(() => {
    return [
      { value: "all", label: "All Years" },
      { value: "2024", label: "2024" },
      { value: "2023", label: "2023" },
      { value: "2022", label: "2022" },
    ];
  }, []);

  // Month options
  const monthOptions = useMemo(() => {
    return [
      { value: "all", label: "All Months" },
      { value: "01", label: "January" },
      { value: "02", label: "February" },
      { value: "03", label: "March" },
      { value: "04", label: "April" },
      { value: "05", label: "May" },
      { value: "06", label: "June" },
      { value: "07", label: "July" },
      { value: "08", label: "August" },
      { value: "09", label: "September" },
      { value: "10", label: "October" },
      { value: "11", label: "November" },
      { value: "12", label: "December" },
    ];
  }, []);

  // Compute the filter parameter for API calls
  const filterParam = useMemo(() => {
    if (selectedYear === "all" && selectedMonth === "all") {
      return null; // No filter
    } else if (selectedYear !== "all" && selectedMonth === "all") {
      return `year=${selectedYear}`; // Year only
    } else if (selectedYear === "all" && selectedMonth !== "all") {
      // Month only - compare across all years (2022-2024)
      // Pass month_only parameter to show that specific month across all years
      return `month_only=${selectedMonth}`;
    } else {
      // Both year and month selected - specific year and month
      return `month=${selectedYear}-${selectedMonth}`;
    }
  }, [selectedYear, selectedMonth]);

  const { data: marketingData, isLoading, error } = useMarketingData(filterParam);
  const {
    data: tvMonthlyData,
    isLoading: tvLoading,
    error: tvError,
  } = useTVMonthlyData(filterParam);
  const {
    data: table2Data,
    isLoading: table2Loading,
    error: table2Error,
  } = useMarketingTable2Data(filterParam);
  const {
    data: radioMonthlyData,
    isLoading: radioLoading,
    error: radioError,
  } = useRadioMonthlyData(filterParam);
  const {
    data: radioChannelsData,
    isLoading: radioChannelsLoading,
    error: radioChannelsError,
  } = useRadioChannelsData(filterParam);

  // Refresh all data
  const handleRefresh = () => {
    window.location.reload();
  };

  // Export data function - PDF Export with high quality
  const exportData = async () => {
    try {
      // Show export overlay
      setIsExporting(true);

      // Wait a brief moment for the overlay to render
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the dashboard container
      const dashboardElement = document.querySelector(".dashboard-container") as HTMLElement;

      if (!dashboardElement) {
        alert("Dashboard container not found. Please refresh and try again.");
        setIsExporting(false);
        return;
      }

      // Hide the export button temporarily
      const exportButton = document.querySelector(
        'button[title*="Opens print dialog"]'
      ) as HTMLElement;

      if (exportButton) exportButton.style.display = "none";

      // Temporarily remove max-width constraints to capture full content
      const originalMaxWidth = dashboardElement.style.maxWidth;
      const originalWidth = dashboardElement.style.width;
      const originalMargin = dashboardElement.style.margin;
      dashboardElement.style.maxWidth = "none";
      dashboardElement.style.width = "fit-content";
      dashboardElement.style.margin = "0";

      // Scroll to top
      window.scrollTo(0, 0);

      // Wait for layout to stabilize after width change
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get the full scrollable width and height (including overflow)
      const fullWidth = Math.max(
        dashboardElement.scrollWidth,
        dashboardElement.offsetWidth,
        dashboardElement.clientWidth
      );
      const fullHeight = Math.max(
        dashboardElement.scrollHeight,
        dashboardElement.offsetHeight,
        dashboardElement.clientHeight
      );

      console.log("📐 Capturing dimensions:", {
        scrollWidth: dashboardElement.scrollWidth,
        offsetWidth: dashboardElement.offsetWidth,
        clientWidth: dashboardElement.clientWidth,
        fullWidth,
        fullHeight,
      });

      // Capture with html-to-image with ULTRA HIGH QUALITY settings
      const dataUrl = await htmlToImage.toPng(dashboardElement, {
        quality: 1.0,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#ffffff",
        width: fullWidth,
        height: fullHeight,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });

      // Restore original styles
      dashboardElement.style.maxWidth = originalMaxWidth;
      dashboardElement.style.width = originalWidth;
      dashboardElement.style.margin = originalMargin;

      // Show hidden elements again
      if (exportButton) exportButton.style.display = "";

      // Create an image to get dimensions
      const img = new Image();
      img.src = dataUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Create PDF - scale down to fit A4
      const scaleFactor = 0.34;
      const pdfWidth = 210;
      const pdfHeight = 297;

      let scaledWidth = img.width * scaleFactor * 0.084667;
      let scaledHeight = img.height * scaleFactor * 0.084667;

      const orientation = scaledHeight > scaledWidth ? "portrait" : "landscape";
      const pageWidth = orientation === "portrait" ? pdfWidth : pdfHeight;
      const pageHeight = orientation === "portrait" ? pdfHeight : pdfWidth;

      const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: "a4",
      });

      const margin = 5;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      if (scaledWidth > availableWidth || scaledHeight > availableHeight) {
        const widthRatio = availableWidth / scaledWidth;
        const heightRatio = availableHeight / scaledHeight;
        const scaleRatio = Math.min(widthRatio, heightRatio);

        scaledWidth = scaledWidth * scaleRatio;
        scaledHeight = scaledHeight * scaleRatio;
      }

      const xOffset = (pageWidth - scaledWidth) / 2;
      const yOffset = (pageHeight - scaledHeight) / 2;

      pdf.addImage(dataUrl, "PNG", xOffset, yOffset, scaledWidth, scaledHeight);

      const fileName = `Marketing_Dashboard_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      pdf.save(fileName);

      console.log("✅ PDF exported successfully!");
    } catch (error) {
      console.error("❌ Error exporting PDF:", error);
      alert(
        `Failed to export PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Debug: Log the marketing data
  console.log("Marketing dashboard received data:", marketingData);
  console.log("TV monthly data:", tvMonthlyData);
  console.log("Table 2 data:", table2Data);
  console.log("Radio monthly data:", radioMonthlyData);
  console.log("Radio channels data:", radioChannelsData);

  if (
    isLoading ||
    tvLoading ||
    table2Loading ||
    radioLoading ||
    radioChannelsLoading
  ) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Header />
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-base text-muted-foreground font-sans">
              Loading Marketing Dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (
    error ||
    !marketingData?.success ||
    tvError ||
    !tvMonthlyData?.success ||
    table2Error ||
    !table2Data?.success ||
    radioError ||
    !radioMonthlyData?.success ||
    radioChannelsError ||
    !radioChannelsData?.success
  ) {
    return (
      <div className="p-6 pt-16 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="">
              <CardTitle className="text-red-800 font-sans text-xl">
                Error Loading Data
              </CardTitle>
            </CardHeader>
            <CardContent className="">
              <p className="text-base text-red-600 font-sans">
                Failed to load marketing data. Please try again later.
              </p>
              {tvError && (
                <p className="text-base text-red-600 mt-2 font-sans">
                  TV monthly data failed to load.
                </p>
              )}
              {table2Error && (
                <p className="text-base text-red-600 mt-2 font-sans">
                  Channel breakdown data failed to load.
                </p>
              )}
              {radioError && (
                <p className="text-base text-red-600 mt-2 font-sans">
                  Radio monthly data failed to load.
                </p>
              )}
              {radioChannelsError && (
                <p className="text-base text-red-600 mt-2 font-sans">
                  Radio channels data failed to load.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { summary, saluranMetrics } = marketingData.data;
  const { chartData: tvChartData, summary: tvSummary } = tvMonthlyData.data;

  // Format number for display
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  // Get trend icon and color
  const getTrendIcon = (direction, change) => {
    if (direction === "increase") {
      return {
        icon: TrendingUp,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    } else if (direction === "decrease") {
      return {
        icon: TrendingDown,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      };
    } else {
      return {
        icon: Activity,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
      };
    }
  };

  const overallTrend = getTrendIcon(
    summary.overallDirection,
    summary.overallChange
  );
  const OverallTrendIcon = overallTrend.icon;

  return (
    <>
      {/* Export Overlay */}
      {isExporting && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-base text-gray-700 font-sans">
              Exporting dashboard to PDF...
            </p>
          </div>
        </div>
      )}

      <div className="p-6 pt-16 max-w-7xl mx-auto space-y-6">
        <div className="pt-6 dashboard-container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-sans">
                Marketing Dashboard
              </h1>
              <p className="text-base text-muted-foreground font-sans mt-2">
                Comprehensive analysis of marketing channel performance and revenue
                breakdown
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Year Filter */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="year-filter"
                  className="text-sm font-medium text-gray-700"
                >
                  Year:
                </label>
                <select
                  id="year-filter"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                >
                  {yearOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Filter */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="month-filter"
                  className="text-sm font-medium text-gray-700"
                >
                  Month:
                </label>
                <select
                  id="month-filter"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                >
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Refresh Button */}
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>

              {/* Export Button */}
              <Button
                onClick={exportData}
                variant="outline"
                size="sm"
                className=""
                title="Opens print dialog. Set Scale to 19 in More Settings for best results."
                disabled={isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Exporting..." : "Print/Export PDF"}
              </Button>
            </div>
          </div>

        {/* Yearly Performance Section - Only show when no month filter is active */}
        {selectedMonth === "all" && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold tracking-tight mb-6 text-center font-sans">
              Yearly Performance
            </h2>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Income Comparison Chart */}
              <MarketingIncomeComparisonChart data={saluranMetrics} />

              {/* Performance Table */}
              <MarketingPerformanceTable data={saluranMetrics} selectedYear={selectedYear} />
            </div>
          </div>
        )}

        {/* TV Performance Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight mb-6 text-center font-sans">
            COMPARISON OF TV REVENUE FOR THE CURRENT DATE (1 JANUARY – 31
            DECEMBER) <br /> YEAR 2022, 2023, 2024
          </h2>

          {/* TV Charts Row */}
          <div className="grid gap-6 lg:grid-cols-1">
            <TVMonthlyPerformanceChart data={tvChartData} />
          </div>

          {/* Channel Breakdown Table under TV section - Only show when no month filter is active */}
          {selectedMonth === "all" && (
            <div className="mt-8">
              <MarketingChannelBreakdownTable 
                data={table2Data?.data} 
                selectedYear={selectedYear}
              />
            </div>
          )}
        </div>

        {/* Radio Performance Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight mb-6 text-center font-sans">
            COMPARISON OF RADIO REVENUE FOR THE CURRENT DATE (1 JANUARY – 31
            DECEMBER) <br /> YEAR 2022, 2023, 2024
          </h2>

          {/* Radio Charts Row */}
          <div className="grid gap-6 lg:grid-cols-1">
            <RadioMonthlyPerformanceChart data={radioMonthlyData?.data} />
          </div>

          {/* Radio Channel Breakdown Table - Only show when no month filter is active */}
          {selectedMonth === "all" && (
            <div className="mt-8">
              <RadioChannelBreakdownTable 
                data={radioChannelsData?.data}
                selectedYear={selectedYear}
              />
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default MarketingDashboard;

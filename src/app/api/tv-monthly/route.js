import { NextResponse } from 'next/server';
import { db } from '../../../index';
import { marketingChannelByMonth } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('TV Monthly Marketing API called');
    
    // Fetch TV monthly data from database
    const monthlyData = await db
      .select()
      .from(marketingChannelByMonth)
      .where(eq(marketingChannelByMonth.report_type, 'Chart 2'));

    console.log('Monthly TV data:', monthlyData);

    // Group data by year and month
    const processedData = {};
    
    monthlyData.forEach(item => {
      const year = item.year;
      const month = item.month;
      const value = parseFloat(item.value) || 0;
      
      if (!processedData[month]) {
        processedData[month] = {
          month: month,
          monthName: getMonthName(month),
          '2022': 0,
          '2023': 0,
          '2024': 0
        };
      }
      
      processedData[month][year.toString()] = value;
    });

    // Convert to array and sort by month
    const chartData = Object.values(processedData).sort((a, b) => a.month - b.month);

    // Calculate yearly totals for summary
    const yearlyTotals = {
      2022: chartData.reduce((sum, item) => sum + (item['2022'] || 0), 0),
      2023: chartData.reduce((sum, item) => sum + (item['2023'] || 0), 0),
      2024: chartData.reduce((sum, item) => sum + (item['2024'] || 0), 0)
    };

    // Calculate growth rates
    const growth2022to2023 = yearlyTotals[2022] > 0 ? 
      ((yearlyTotals[2023] - yearlyTotals[2022]) / yearlyTotals[2022]) * 100 : 0;
    
    const growth2023to2024 = yearlyTotals[2023] > 0 ? 
      ((yearlyTotals[2024] - yearlyTotals[2023]) / yearlyTotals[2023]) * 100 : 0;

    const response = {
      success: true,
      data: {
        chartData,
        summary: {
          yearlyTotals,
          growth2022to2023: growth2022to2023.toFixed(1),
          growth2023to2024: growth2023to2024.toFixed(1),
          totalMonths: chartData.length,
          formattedTotals: {
            2022: formatCurrency(yearlyTotals[2022]),
            2023: formatCurrency(yearlyTotals[2023]),
            2024: formatCurrency(yearlyTotals[2024])
          }
        }
      }
    };

    console.log('TV Monthly API response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('TV Monthly API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch TV monthly data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Helper function to get month name
function getMonthName(monthNumber) {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return months[monthNumber - 1] || monthNumber.toString();
}

// Helper function to format currency
function formatCurrency(value) {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

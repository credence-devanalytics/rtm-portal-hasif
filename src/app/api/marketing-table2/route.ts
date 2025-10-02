import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { marketingChannelByYear } from '../../../../drizzle/schema';

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

export async function GET() {
  try {
    console.log('Marketing Table 2 API called');
    
    const table2Data = await db
      .select()
      .from(marketingChannelByYear)
      .where(eq(marketingChannelByYear.report_type, 'Table 2'));

    console.log('Table 2 data:', table2Data);

    // Group data by channel and year
    const channelData = {};
    table2Data.forEach(item => {
      const channel = item.saluran;
      if (!channelData[channel]) {
        channelData[channel] = {};
      }
      channelData[channel][item.year] = parseFloat(item.value) || 0;
    });

    // Calculate growth percentages and format data
    const formattedData = Object.keys(channelData).map(channel => {
      const data2022 = channelData[channel][2022] || 0;
      const data2023 = channelData[channel][2023] || 0;
      const data2024 = channelData[channel][2024] || 0;

      // Calculate growth percentages
      const growth2022to2023 = data2022 !== 0 ? (((data2023 - data2022) / data2022) * 100) : 0;
      const growth2023to2024 = data2023 !== 0 ? (((data2024 - data2023) / data2023) * 100) : 0;

      return {
        channel,
        year2022: data2022,
        year2023: data2023,
        year2024: data2024,
        growth2022to2023: parseFloat(growth2022to2023.toFixed(1)),
        growth2023to2024: parseFloat(growth2023to2024.toFixed(1)),
        formatted2022: `RM ${data2022.toLocaleString()}`,
        formatted2023: `RM ${data2023.toLocaleString()}`,
        formatted2024: `RM ${data2024.toLocaleString()}`
      };
    });

    // Calculate totals
    const totals = {
      year2022: Object.values(channelData).reduce((sum, channel) => sum + (channel[2022] || 0), 0),
      year2023: Object.values(channelData).reduce((sum, channel) => sum + (channel[2023] || 0), 0),
      year2024: Object.values(channelData).reduce((sum, channel) => sum + (channel[2024] || 0), 0)
    };

    const totalGrowth2022to2023 = totals.year2022 !== 0 ? (((totals.year2023 - totals.year2022) / totals.year2022) * 100) : 0;
    const totalGrowth2023to2024 = totals.year2023 !== 0 ? (((totals.year2024 - totals.year2023) / totals.year2023) * 100) : 0;

    const totalsRow = {
      channel: 'Total',
      year2022: totals.year2022,
      year2023: totals.year2023,
      year2024: totals.year2024,
      growth2022to2023: parseFloat(totalGrowth2022to2023.toFixed(1)),
      growth2023to2024: parseFloat(totalGrowth2023to2024.toFixed(1)),
      formatted2022: `RM ${totals.year2022.toLocaleString()}`,
      formatted2023: `RM ${totals.year2023.toLocaleString()}`,
      formatted2024: `RM ${totals.year2024.toLocaleString()}`
    };

    console.log('Marketing Table 2 API response:', {
      success: true,
      data: {
        channels: formattedData,
        totals: totalsRow
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        channels: formattedData,
        totals: totalsRow
      }
    });

  } catch (error) {
    console.error('Marketing Table 2 API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

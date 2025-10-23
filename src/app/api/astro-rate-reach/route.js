import { NextResponse } from "next/server";
// import { db } from '@/index';
import { db } from "@/index";
import { astroRateNReach } from "../../../../drizzle/schema";
import { sql, eq, and, gte, lte, inArray } from "drizzle-orm";

export async function GET(request) {
	try {
		console.log("Astro Rate & Reach API called");

		// Get query parameters
		const { searchParams } = new URL(request.url);
		const year = searchParams.get("year");
		const month = searchParams.get("month");
		const channel = searchParams.get("channel");
		const metricType = searchParams.get("metricType");
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");
		const groupBy = searchParams.get("groupBy"); // channel, metric, month, year

		// Build where conditions
		const conditions = [];

		if (year) {
			conditions.push(eq(astroRateNReach.txYear, parseInt(year)));
		}

		if (month) {
			conditions.push(eq(astroRateNReach.txMonth, parseInt(month)));
		}

		if (channel) {
			conditions.push(eq(astroRateNReach.channel, channel));
		}

		if (metricType) {
			conditions.push(eq(astroRateNReach.metricType, metricType));
		}

		if (startDate) {
			conditions.push(gte(astroRateNReach.txDate, startDate));
		}

		if (endDate) {
			conditions.push(lte(astroRateNReach.txDate, endDate));
		}

		// If groupBy is specified, return aggregated data
		if (groupBy) {
			let selectFields = {
				totalValue: sql`SUM(${astroRateNReach.value})`.as("totalValue"),
				avgValue: sql`AVG(${astroRateNReach.value})`.as("avgValue"),
				recordCount: sql`COUNT(*)`.as("recordCount"),
			};

			let groupByFields = [];

			if (groupBy.includes("channel")) {
				selectFields.channel = astroRateNReach.channel;
				groupByFields.push(astroRateNReach.channel);
			}

			if (groupBy.includes("metric")) {
				selectFields.metricType = astroRateNReach.metricType;
				groupByFields.push(astroRateNReach.metricType);
			}

			if (groupBy.includes("month")) {
				selectFields.txMonth = astroRateNReach.txMonth;
				groupByFields.push(astroRateNReach.txMonth);
			}

			if (groupBy.includes("year")) {
				selectFields.txYear = astroRateNReach.txYear;
				groupByFields.push(astroRateNReach.txYear);
			}

			let query = db.select(selectFields).from(astroRateNReach);

			if (conditions.length > 0) {
				query = query.where(and(...conditions));
			}

			if (groupByFields.length > 0) {
				query = query.groupBy(...groupByFields);
			}

			const data = await query;

			return NextResponse.json({
				success: true,
				data: data.map((item) => ({
					...item,
					totalValue: parseInt(item.totalValue) || 0,
					avgValue: parseFloat(item.avgValue) || 0,
					recordCount: parseInt(item.recordCount) || 0,
				})),
			});
		}

		// Otherwise, return detailed records
		let query = db.select().from(astroRateNReach);

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		query = query.orderBy(astroRateNReach.txDate, astroRateNReach.channel);

		const data = await query;

		// Get available channels and metrics for filtering
		const channels = await db
			.selectDistinct({ channel: astroRateNReach.channel })
			.from(astroRateNReach)
			.orderBy(astroRateNReach.channel);

		const metrics = await db
			.selectDistinct({ metricType: astroRateNReach.metricType })
			.from(astroRateNReach)
			.orderBy(astroRateNReach.metricType);

    // Get the latest date directly from the database using MAX
    const latestDateResult = await db
      .select({ maxDate: sql`MAX(${astroRateNReach.txDate})` })
      .from(astroRateNReach);
    
    const latestDate = latestDateResult[0]?.maxDate || null;

    return NextResponse.json({
      success: true,
      data: data,
      latestDate: latestDate,
      filters: {
        channels: channels.map(c => c.channel).filter(Boolean),
        metricTypes: metrics.map(m => m.metricType).filter(Boolean)
      },
      summary: {
        totalRecords: data.length,
        totalValue: data.reduce((sum, item) => sum + (item.value || 0), 0),
        avgValue: data.length > 0 ? data.reduce((sum, item) => sum + (item.value || 0), 0) / data.length : 0
      }
    });

  } catch (error) {
    console.error('Astro Rate & Reach API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch Astro Rate & Reach data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

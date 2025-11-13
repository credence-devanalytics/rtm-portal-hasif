import { db } from "@/index";
import { mentionsClassify } from "@/lib/schema";
import { and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { buildWhereConditions } from "@/lib/cache";

export async function GET(request: Request) {
	const startTime = Date.now();
	try {
		const { searchParams } = new URL(request.url);

		// Extract filter parameters
		const filters = {
			fromDate: searchParams.get("from") || "",
			toDate: searchParams.get("to") || "",
			platform: searchParams.get("platform") || "",
			channel: searchParams.get("channel") || "",
			unit: searchParams.get("unit") || "",
		};

		console.log("📊 RTM Platforms API called with filters:", filters);

		// Build where conditions based on filters
		// NOTE: We apply ALL filters including platform, channel, and unit
		// This ensures consistency with other charts (e.g., RTM Units chart)
		const whereConditions = buildWhereConditions(
			filters, // Apply all filters for consistent results
			mentionsClassify
		);

		const queryStartTime = Date.now();

		// Query platform counts
		const result = await db
			.select({
				platform: mentionsClassify.type,
				count: sql<number>`COUNT(*)`,
			})
			.from(mentionsClassify)
			.where(and(...whereConditions))
			.groupBy(mentionsClassify.type);

		console.log(`⏱️ Database query took ${Date.now() - queryStartTime}ms`);
		console.log("✅ RTM Platforms response:", result.length, "platforms");
		console.log("📊 Platform data:", result.map(r => ({
			platform: r.platform,
			count: r.count
		})));

		// Calculate grand total for verification
		const grandTotal = result.reduce((sum, r) => sum + Number(r.count), 0);
		console.log("🔢 Platforms Grand Total:", grandTotal);
		console.log("🔍 WHERE CONDITIONS APPLIED:", whereConditions.length, "conditions");

		console.log(`⏱️ Total API time: ${Date.now() - startTime}ms`);

		return NextResponse.json({
			data: result.map((row) => ({
				platform: row.platform || "Unknown",
				count: Number(row.count) || 0,
			})),
			meta: {
				queryDate: new Date().toISOString(),
				filters,
				totalPosts: grandTotal,
			},
		});
	} catch (error) {
		console.error("❌ RTM Platforms API error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch RTM platforms data", details: error.message },
			{ status: 500 }
		);
	}
}

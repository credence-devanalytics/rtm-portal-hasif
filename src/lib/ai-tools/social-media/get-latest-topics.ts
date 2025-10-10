import { db } from "@/index";
import { mentionsClassifyPublic } from "@/lib/schema";
import { desc, gte, and, sql, count, sum, avg } from "drizzle-orm";
import { subDays } from "date-fns";

export async function getLatestTopics(days: number) {
	const cutoffDate = subDays(new Date(), days).toISOString();
	const mentions = await db
		.select()
		.from(mentionsClassifyPublic)
		// .orderBy(desc(mentionsClassifyPublic.inserttime))
		.where(gte(mentionsClassifyPublic.inserttime, cutoffDate))
		.orderBy(desc(mentionsClassifyPublic.engagementrate))
		.limit(10);

	// console.log({ mentions });

	return mentions;
}

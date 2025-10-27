import { NextResponse } from "next/server";
import { db } from "@/index";

export async function GET() {
	try {
		console.log("Testing database connection...");

		// Test basic connection
		const result = await db.execute("SELECT NOW() as current_time");
		console.log("Database connection successful:", result);

		return NextResponse.json({
			success: true,
			message: "Database connection successful",
			timestamp: result.rows?.[0]?.current_time || new Date().toISOString(),
		});
	} catch (error) {
		console.error("Database connection error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Database connection failed",
				details: error.message,
				stack: error.stack,
			},
			{ status: 500 }
		);
	}
}

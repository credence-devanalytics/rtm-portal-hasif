import { auth } from "@/lib/auth";
import { db } from "@/index";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
	try {
		console.log("Getting session for user API...");
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		console.log("Session data:", session);

		if (!session?.user?.id) {
			console.log("No session or user ID found");
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		console.log("Fetching user data for ID:", session.user.id);

		// Get user data with role from database
		const userData = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				role: users.role,
				image: users.image,
			})
			.from(users)
			.where(eq(users.id, session.user.id))
			.limit(1);

		console.log("Database query result:", userData);

		if (!userData.length) {
			console.log("User not found in database");
			return Response.json({ error: "User not found" }, { status: 404 });
		}

		console.log("Returning user data:", userData[0]);
		return Response.json({ user: userData[0] });
	} catch (error) {
		console.error("Error fetching user data:", error);
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}
}

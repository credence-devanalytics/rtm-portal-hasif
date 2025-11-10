import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/index";
import * as schema from "@/lib/schema";

// const isProduction = process.env.NODE_ENV === "production";
// const trustedOriginsList = [
//     process.env.CORS_ORIGIN || "",
//     process.env.BETTER_AUTH_URL || "",
//     isProduction ? "https://demo-portal.nightmunch.com" : "",
//     "http://localhost:3000", // Add localhost for development
//   ].filter(Boolean); // Remove empty strings
// const baseURLList = isProduction
//   ? (process.env.BETTER_AUTH_URL || "https://demo-portal.nightmunch.com")
//   : (process.env.BETTER_AUTH_URL || "http://localhost:3000");

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg", // Changed from "sqlite" to "pg" for PostgreSQL
		schema: {
			user: schema.users,
			session: schema.sessions,
			account: schema.accounts,
			verification: schema.verificationTokens,
		},
	}),
	advanced: {
		database: {
			useNumberId: true,
		},
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: false,
				defaultValue: "user",
				input: false, // don't allow user to set role
			},
			status: {
				type: "string",
				required: false,
				defaultValue: "pending",
				input: false, // don't allow user to set status
			},
		},
	},

	trustedOrigins: [
		process.env.CORS_ORIGIN || "",
		process.env.BETTER_AUTH_URL || "",
		"http://localhost:3000", // Add localhost for development
	].filter(Boolean), // Remove empty strings

	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false, // Disable email verification for now
	},

	secret:
		process.env.BETTER_AUTH_SECRET ||
		"fallback-secret-key-for-development-only",
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

export type Session = typeof auth.$Infer.Session;

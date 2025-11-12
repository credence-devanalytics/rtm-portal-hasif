import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/index";
import * as schema from "@/lib/schema";
import { eq } from "drizzle-orm";

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
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
	},
	socialProviders: {
		microsoft: { 
			clientId: process.env.MICROSOFT_CLIENT_ID as string, 
			clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string, 
			tenantId: process.env.MICROSOFT_CLIENT_TENANT_ID as string || "common", 
			getUserInfo: async (token) => {
				try {
					const res = await fetch("https://graph.microsoft.com/v1.0/me", {
						headers: {
							Authorization: `Bearer ${token.accessToken}`,
						},
					});

					if (!res.ok) {
						throw new Error(`Failed to fetch user info: ${res.statusText}`);
					}

					const userInfo = await res.json();

					// Fetch group membership
					const groupRes = await fetch(
						"https://graph.microsoft.com/v1.0/me/memberOf",
						{
							headers: {
								Authorization: `Bearer ${token.accessToken}`,
							},
						}
					);

					const groups = groupRes.ok ? await groupRes.json() : { value: [] };

					// update user profile with groups and profile picture
					if (groups.value && groups.value.length > 0) {
						await db
							.update(schema.users)
							.set({
								group: groups.value[0].displayName,
							})
							.where(eq(schema.users.email, userInfo.userPrincipalName));
					}

					return {
						user: {
							id: userInfo.id,
							name: userInfo.displayName,
							email: userInfo.userPrincipalName,
							emailVerified: true,
							createdAt: new Date(),
							updatedAt: new Date(),
							group: groups.value[0]?.displayName,
						},
						data: userInfo,
					};
				} catch (error) {
					console.error("Error in getUserInfo:", error);
					throw error;
				}
			},
			requireSelectAccount: true,
		}, 
	},
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
			image: {
				type: "string",
				required: false,
			},
			group: {
				type: "string",
				required: false,
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
export type AuthUser = typeof auth.$Infer.Session.user;
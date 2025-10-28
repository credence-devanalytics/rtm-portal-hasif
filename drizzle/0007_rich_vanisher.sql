ALTER TABLE "user_account" RENAME COLUMN "accountId" TO "accountid";--> statement-breakpoint
ALTER TABLE "user_account" RENAME COLUMN "providerId" TO "providerid";--> statement-breakpoint
ALTER TABLE "user_account" RENAME COLUMN "userId" TO "userid";--> statement-breakpoint
ALTER TABLE "user_account" RENAME COLUMN "accessToken" TO "accesstoken";--> statement-breakpoint
ALTER TABLE "user_account" RENAME COLUMN "refreshToken" TO "refreshtoken";--> statement-breakpoint
ALTER TABLE "user_account" RENAME COLUMN "idToken" TO "idtoken";--> statement-breakpoint
ALTER TABLE "user_account" RENAME COLUMN "accessTokenExpiresAt" TO "accesstokenexpiresat";--> statement-breakpoint
ALTER TABLE "user_account" RENAME COLUMN "refreshTokenExpiresAt" TO "refreshtokenexpiresat";--> statement-breakpoint
ALTER TABLE "user_account" RENAME COLUMN "createdAt" TO "createdat";--> statement-breakpoint
ALTER TABLE "user_account" RENAME COLUMN "updatedAt" TO "updatedat";--> statement-breakpoint
ALTER TABLE "user_session" RENAME COLUMN "expiresAt" TO "expiresat";--> statement-breakpoint
ALTER TABLE "user_session" RENAME COLUMN "createdAt" TO "createdat";--> statement-breakpoint
ALTER TABLE "user_session" RENAME COLUMN "updatedAt" TO "updatedat";--> statement-breakpoint
ALTER TABLE "user_session" RENAME COLUMN "ipAddress" TO "ipaddress";--> statement-breakpoint
ALTER TABLE "user_session" RENAME COLUMN "userAgent" TO "useragent";--> statement-breakpoint
ALTER TABLE "user_session" RENAME COLUMN "userId" TO "userid";--> statement-breakpoint
ALTER TABLE "user_access" RENAME COLUMN "userId" TO "userid";--> statement-breakpoint
ALTER TABLE "user_access" RENAME COLUMN "socmedAcc" TO "socmedacc";--> statement-breakpoint
ALTER TABLE "user_access" RENAME COLUMN "socmedSent" TO "socmedsent";--> statement-breakpoint
ALTER TABLE "user_access" RENAME COLUMN "createdAt" TO "createdat";--> statement-breakpoint
ALTER TABLE "user_access" RENAME COLUMN "updatedAt" TO "updatedat";--> statement-breakpoint
ALTER TABLE "user_profile" RENAME COLUMN "systemId" TO "systemid";--> statement-breakpoint
ALTER TABLE "user_profile" RENAME COLUMN "taskRole" TO "taskrole";--> statement-breakpoint
ALTER TABLE "user_profile" RENAME COLUMN "emailVerified" TO "emailverified";--> statement-breakpoint
ALTER TABLE "user_profile" RENAME COLUMN "createdAt" TO "createdat";--> statement-breakpoint
ALTER TABLE "user_profile" RENAME COLUMN "updatedAt" TO "updatedat";--> statement-breakpoint
ALTER TABLE "user_verification" RENAME COLUMN "expiresAt" TO "expiresat";--> statement-breakpoint
ALTER TABLE "user_verification" RENAME COLUMN "createdAt" TO "createdat";--> statement-breakpoint
ALTER TABLE "user_verification" RENAME COLUMN "updatedAt" TO "updatedat";--> statement-breakpoint
ALTER TABLE "user_account" DROP CONSTRAINT "user_account_userId_user_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "user_session" DROP CONSTRAINT "user_session_userId_user_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "user_access" DROP CONSTRAINT "user_access_userId_user_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_userid_user_profile_id_fk" FOREIGN KEY ("userid") REFERENCES "public"."user_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_userid_user_profile_id_fk" FOREIGN KEY ("userid") REFERENCES "public"."user_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_access" ADD CONSTRAINT "user_access_userid_user_profile_id_fk" FOREIGN KEY ("userid") REFERENCES "public"."user_profile"("id") ON DELETE no action ON UPDATE no action;
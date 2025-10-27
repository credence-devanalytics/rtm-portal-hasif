ALTER TABLE "account" RENAME TO "user_account";--> statement-breakpoint
ALTER TABLE "session" RENAME TO "user_session";--> statement-breakpoint
ALTER TABLE "user" RENAME TO "user_profile";--> statement-breakpoint
ALTER TABLE "verification" RENAME TO "user_verification";--> statement-breakpoint
ALTER TABLE "user_session" DROP CONSTRAINT "session_token_unique";--> statement-breakpoint
ALTER TABLE "user_profile" DROP CONSTRAINT "user_email_unique";--> statement-breakpoint
ALTER TABLE "user_account" DROP CONSTRAINT "account_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_session" DROP CONSTRAINT "session_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_userId_user_profile_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_userId_user_profile_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_token_unique" UNIQUE("token");--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_email_unique" UNIQUE("email");
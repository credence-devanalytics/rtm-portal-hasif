ALTER TABLE "user_session" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;
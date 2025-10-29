CREATE TABLE "user_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"socmedAcc" boolean DEFAULT false NOT NULL,
	"socmedSent" boolean DEFAULT false NOT NULL,
	"rtmklik" boolean DEFAULT false NOT NULL,
	"mytv" boolean DEFAULT false NOT NULL,
	"astro" boolean DEFAULT false NOT NULL,
	"unifitv" boolean DEFAULT false NOT NULL,
	"wartaberita" boolean DEFAULT false NOT NULL,
	"marketing" boolean DEFAULT false NOT NULL,
	"permission" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_access" ADD CONSTRAINT "user_access_userId_user_profile_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user_profile"("id") ON DELETE no action ON UPDATE no action;
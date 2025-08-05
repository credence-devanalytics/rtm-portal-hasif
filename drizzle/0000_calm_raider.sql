CREATE TABLE "mentions" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" varchar(100),
	"sentiment" varchar(50),
	"content" text,
	"author" varchar(255),
	"date" timestamp,
	"likes" integer DEFAULT 0,
	"shares" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"reach" integer DEFAULT 0,
	"engagement" numeric(5, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

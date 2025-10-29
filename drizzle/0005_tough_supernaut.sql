CREATE TABLE "marketing_channel_bymonth" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type" varchar,
	"report_title" text,
	"saluran" varchar,
	"groupby" varchar,
	"year" integer,
	"month" varchar,
	"value" varchar,
	"insertdate" timestamp,
	"updatedate" timestamp
);
--> statement-breakpoint
CREATE TABLE "marketing_channel_byyear" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type" varchar,
	"report_title" text,
	"saluran" varchar,
	"groupby" varchar,
	"year" integer,
	"value" varchar,
	"insertdate" timestamp,
	"updatedate" timestamp
);
--> statement-breakpoint
CREATE TABLE "pberita_audience_age" (
	"id" serial PRIMARY KEY NOT NULL,
	"useragebracket" text,
	"date" date,
	"hour" text,
	"activeusers" integer,
	"newusers" integer,
	CONSTRAINT "uq_pberita_audience_age_useragebracket_date_hour" UNIQUE("useragebracket","date","hour")
);
--> statement-breakpoint
CREATE TABLE "pberita_audience_gender" (
	"id" serial PRIMARY KEY NOT NULL,
	"usergender" text,
	"date" date,
	"hour" text,
	"activeusers" integer,
	"newusers" integer,
	CONSTRAINT "uq_pberita_audience_gender_usergender_date_hour" UNIQUE("usergender","date","hour")
);
--> statement-breakpoint
CREATE TABLE "rtmklik_age" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date,
	"hour" text,
	"age" text,
	"metric" text,
	"value" integer,
	CONSTRAINT "uq_rtmklik_age_age_hour_date_metric" UNIQUE("date","hour","age","metric")
);
--> statement-breakpoint
CREATE TABLE "rtmklik_gender" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date,
	"hour" text,
	"gender" text,
	"metric" text,
	"value" integer,
	CONSTRAINT "uq_rtmklik_gender_gender_hour_date_metric" UNIQUE("date","hour","gender","metric")
);

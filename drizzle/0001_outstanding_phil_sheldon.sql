CREATE TABLE "mentions_classify" (
	"id" varchar,
	"type" text,
	"mention" text,
	"languages" text,
	"from" text,
	"author" text,
	"inserttime" timestamp,
	"title" text,
	"url" text,
	"image" text,
	"reach" double precision,
	"databaseinserttime" bigint,
	"keywords" text,
	"locations" text,
	"autosentiment" text,
	"interaction" double precision,
	"score" double precision,
	"youtubechannelid" varchar,
	"viewcount" double precision,
	"likecount" double precision,
	"commentcount" double precision,
	"fullmention" text,
	"description" text,
	"duration" double precision,
	"tagfeedlocations" text,
	"keywordid" varchar,
	"channel" text,
	"channelgroup" text,
	"groupid" varchar,
	"groupname" text,
	"channels" text,
	"sourcereach" double precision,
	"influencescore" double precision,
	"photo" text,
	"originalphoto" text,
	"photos" text,
	"originalphotos" text,
	"virality" double precision,
	"domain" text,
	"sharecount" double precision,
	"engagementrate" double precision,
	"followerscount" double precision,
	"facebookpageid" varchar,
	"lovecount" double precision,
	"wowcount" double precision,
	"hahacount" double precision,
	"sadcount" double precision,
	"angrycount" double precision,
	"totalreactionscount" double precision,
	"mediatype" text,
	"authorgender" text,
	"twitterprofileid" varchar,
	"favoritecount" double precision,
	"retweetcount" double precision,
	"replycount" double precision,
	"quotecount" double precision,
	"twitterhandle" text,
	"tweettype" text,
	"instagramprofileid" varchar,
	"instagramprofilename" text,
	"instagrampostid" varchar,
	"posttype" text,
	"tiktokid" varchar,
	"diggcount" double precision,
	"playcount" double precision,
	"videodurationseconds" double precision,
	"authorfollowercount" double precision,
	"subreddit" text,
	"reddittype" text,
	"redditfullname" text,
	"redditscore" double precision,
	"redditcommentid" varchar,
	"redditparentlinkid" varchar,
	"insertdate" date,
	"topic" varchar,
	"confidence" double precision,
	"sentiment" varchar,
	"input_tokens" double precision,
	"output_tokens" double precision,
	"total_tokens" double precision,
	"downloaddate" date DEFAULT (CURRENT_DATE + '1 day'::interval) NOT NULL,
	"idpk" serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentions_classify_public" (
	"id" varchar,
	"type" text,
	"mention" text,
	"languages" text,
	"from" text,
	"author" text,
	"inserttime" timestamp,
	"title" text,
	"url" text,
	"image" text,
	"reach" double precision,
	"databaseinserttime" bigint,
	"keywords" text,
	"locations" text,
	"autosentiment" text,
	"interaction" double precision,
	"score" double precision,
	"youtubechannelid" varchar,
	"viewcount" double precision,
	"likecount" double precision,
	"commentcount" double precision,
	"fullmention" text,
	"description" text,
	"duration" double precision,
	"tagfeedlocations" text,
	"keywordid" varchar,
	"channel" text,
	"channelgroup" text,
	"groupid" varchar,
	"groupname" text,
	"channels" text,
	"sourcereach" double precision,
	"influencescore" double precision,
	"photo" text,
	"originalphoto" text,
	"photos" text,
	"originalphotos" text,
	"virality" double precision,
	"domain" text,
	"sharecount" double precision,
	"engagementrate" double precision,
	"followerscount" double precision,
	"facebookpageid" varchar,
	"lovecount" double precision,
	"wowcount" double precision,
	"hahacount" double precision,
	"sadcount" double precision,
	"angrycount" double precision,
	"totalreactionscount" double precision,
	"mediatype" text,
	"authorgender" text,
	"twitterprofileid" varchar,
	"favoritecount" double precision,
	"retweetcount" double precision,
	"replycount" double precision,
	"quotecount" double precision,
	"twitterhandle" text,
	"tweettype" text,
	"instagramprofileid" varchar,
	"instagramprofilename" text,
	"instagrampostid" varchar,
	"posttype" text,
	"tiktokid" varchar,
	"diggcount" double precision,
	"playcount" double precision,
	"videodurationseconds" double precision,
	"authorfollowercount" double precision,
	"subreddit" text,
	"reddittype" text,
	"redditfullname" text,
	"redditscore" double precision,
	"redditcommentid" varchar,
	"redditparentlinkid" varchar,
	"insertdate" date,
	"topic" varchar,
	"confidence" double precision,
	"sentiment" varchar,
	"input_tokens" double precision,
	"output_tokens" double precision,
	"total_tokens" double precision,
	"downloaddate" date DEFAULT CURRENT_DATE NOT NULL,
	"idpk" serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_media_data" (
	"readable_time" timestamp with time zone,
	"id" varchar,
	"type" text,
	"mention" text,
	"languages" text,
	"from" text,
	"author" text,
	"inserttime" bigint,
	"title" text,
	"url" text,
	"image" text,
	"photo" text,
	"originalphoto" text,
	"photos" text,
	"originalphotos" text,
	"reach" double precision,
	"databaseinserttime" bigint,
	"keywords" text,
	"locations" text,
	"autosentiment" text,
	"sourcereach" double precision,
	"interaction" double precision,
	"influencescore" double precision,
	"followerscount" integer,
	"score" integer,
	"facebookpageid" varchar,
	"likecount" integer,
	"lovecount" integer,
	"wowcount" integer,
	"hahacount" integer,
	"sadcount" integer,
	"angrycount" integer,
	"totalreactionscount" integer,
	"commentcount" integer,
	"sharecount" integer,
	"mediatype" text,
	"fullmention" text,
	"tagfeedlocations" text,
	"engagementrate" double precision,
	"keywordid" varchar,
	"keywordname" text,
	"groupid" varchar,
	"groupname" text,
	"keywordnames" text,
	"authorgender" text,
	"twitterprofileid" varchar,
	"favoritecount" integer,
	"retweetcount" integer,
	"replycount" integer,
	"quotecount" integer,
	"twitterhandle" text,
	"tweettype" text,
	"virality" double precision,
	"domain" text,
	"description" text,
	"instagramprofileid" varchar,
	"instagramprofilename" text,
	"instagrampostid" varchar,
	"posttype" text,
	"viewcount" integer,
	"youtubechannelid" varchar,
	"duration" double precision,
	"tiktokid" varchar,
	"diggcount" integer,
	"playcount" integer,
	"videodurationseconds" double precision,
	"authorfollowercount" integer,
	"subreddit" text,
	"reddittype" text,
	"redditfullname" text,
	"redditscore" double precision,
	"redditcommentid" varchar,
	"redditparentlinkid" varchar,
	"tweetsourcename" text,
	"tweetsourceurl" text,
	"category" text,
	"sub_category" text,
	"sentiment" text,
	"input_tokens" varchar,
	"output_tokens" varchar
);
--> statement-breakpoint
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'mentions'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "mentions" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "mentions" ALTER COLUMN "id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "mentions" ALTER COLUMN "id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "mentions" ALTER COLUMN "author" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "mentions" ALTER COLUMN "reach" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "mentions" ALTER COLUMN "reach" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "type" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "mention" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "languages" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "from" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "inserttime" timestamp;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "url" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "databaseinserttime" bigint;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "keywords" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "locations" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "autosentiment" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "interaction" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "score" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "youtubechannelid" varchar;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "viewcount" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "likecount" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "commentcount" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "fullmention" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "duration" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "tagfeedlocations" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "keywordid" varchar;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "keywordname" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "groupid" varchar;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "groupname" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "keywordnames" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "sourcereach" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "influencescore" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "photo" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "originalphoto" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "photos" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "originalphotos" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "virality" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "domain" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "sharecount" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "engagementrate" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "followerscount" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "facebookpageid" varchar;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "lovecount" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "wowcount" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "hahacount" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "sadcount" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "angrycount" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "totalreactionscount" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "mediatype" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "authorgender" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "twitterprofileid" varchar;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "favoritecount" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "retweetcount" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "replycount" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "quotecount" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "twitterhandle" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "tweettype" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "instagramprofileid" varchar;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "instagramprofilename" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "instagrampostid" varchar;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "posttype" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "tiktokid" varchar;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "diggcount" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "playcount" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "videodurationseconds" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "authorfollowercount" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "subreddit" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "reddittype" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "redditfullname" text;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "redditscore" double precision;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "redditcommentid" varchar;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "redditparentlinkid" varchar;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "insertdate" date;--> statement-breakpoint
ALTER TABLE "mentions" ADD COLUMN "downloaddate" date DEFAULT (CURRENT_DATE + '1 day'::interval) NOT NULL;--> statement-breakpoint
ALTER TABLE "mentions" DROP COLUMN "platform";--> statement-breakpoint
ALTER TABLE "mentions" DROP COLUMN "sentiment";--> statement-breakpoint
ALTER TABLE "mentions" DROP COLUMN "content";--> statement-breakpoint
ALTER TABLE "mentions" DROP COLUMN "date";--> statement-breakpoint
ALTER TABLE "mentions" DROP COLUMN "likes";--> statement-breakpoint
ALTER TABLE "mentions" DROP COLUMN "shares";--> statement-breakpoint
ALTER TABLE "mentions" DROP COLUMN "comments";--> statement-breakpoint
ALTER TABLE "mentions" DROP COLUMN "engagement";--> statement-breakpoint
ALTER TABLE "mentions" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "mentions" DROP COLUMN "updated_at";
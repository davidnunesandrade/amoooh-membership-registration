-- Create DisplayMedium table
CREATE TABLE "display_medium" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"location" text,
	"contact_info" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "display_medium_name_unique" UNIQUE("name")
);
--> statement-breakpoint

-- Create Agency table
CREATE TABLE "agency" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"contact_info" text,
	"description" text,
	"website" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Create Advertiser table
CREATE TABLE "advertiser" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"agency_id" integer NOT NULL,
	"industry" text,
	"contact_info" text,
	"description" text,
	"website" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Create Member table
CREATE TABLE "member" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"company_id" integer,
	"role" text DEFAULT 'member' NOT NULL,
	"phone" text,
	"position" text,
	"bio" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "member_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint

-- Create MemberMedia join table
CREATE TABLE "member_media" (
	"member_id" integer NOT NULL,
	"display_medium_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "member_media_member_id_display_medium_id_pk" PRIMARY KEY("member_id","display_medium_id")
);
--> statement-breakpoint

-- Add foreign key constraints
ALTER TABLE "advertiser" ADD CONSTRAINT "advertiser_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agency"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_company_id_display_medium_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."display_medium"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "member_media" ADD CONSTRAINT "member_media_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "member_media" ADD CONSTRAINT "member_media_display_medium_id_display_medium_id_fk" FOREIGN KEY ("display_medium_id") REFERENCES "public"."display_medium"("id") ON DELETE cascade ON UPDATE no action;

-- Create indexes for better query performance
CREATE INDEX "idx_advertiser_agency_id" ON "advertiser"("agency_id");
CREATE INDEX "idx_member_user_id" ON "member"("user_id");
CREATE INDEX "idx_member_company_id" ON "member"("company_id");
CREATE INDEX "idx_member_media_member_id" ON "member_media"("member_id");
CREATE INDEX "idx_member_media_display_medium_id" ON "member_media"("display_medium_id");

-- Initial Drizzle schema for a new, empty HP Learny database.
-- Keep this baseline fixed; apply later changes through drizzle/ migrations.
CREATE TABLE "Attachment" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"url" text NOT NULL,
	"name" text NOT NULL,
	"courseId" text NOT NULL
);

CREATE TABLE "Category" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"name" text NOT NULL
);

CREATE TABLE "Chapter" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"title" text NOT NULL,
	"position" integer NOT NULL,
	"isFree" boolean DEFAULT false NOT NULL,
	"isPublished" boolean DEFAULT false NOT NULL,
	"description" text,
	"videoUrl" text,
	"courseId" text NOT NULL
);

CREATE TABLE "Course" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"title" text NOT NULL,
	"userId" text NOT NULL,
	"isPublished" boolean DEFAULT false NOT NULL,
	"description" text,
	"imageUrl" text,
	"price" double precision,
	"categoryId" text
);

CREATE TABLE "MuxData" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"assetId" text NOT NULL,
	"playbackId" text,
	"chapterId" text NOT NULL
);

CREATE TABLE "Purchase" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"userId" text NOT NULL,
	"courseId" text NOT NULL
);

CREATE TABLE "StripeCustomer" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"userId" text NOT NULL,
	"stripeCustomerId" text NOT NULL
);

CREATE TABLE "UserProgress" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"userId" text NOT NULL,
	"chapterId" text NOT NULL,
	"isCompleted" boolean DEFAULT false NOT NULL
);

ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "Course" ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE set null ON UPDATE cascade;
ALTER TABLE "MuxData" ADD CONSTRAINT "MuxData_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE cascade ON UPDATE cascade;
CREATE INDEX "Attachment_courseId_idx" ON "Attachment" USING btree ("courseId" text_ops);
CREATE INDEX "Chapter_courseId_idx" ON "Chapter" USING btree ("courseId" text_ops);
CREATE INDEX "Course_categoryId_idx" ON "Course" USING btree ("categoryId" text_ops);
CREATE INDEX "Course_userId_idx" ON "Course" USING btree ("userId" text_ops);
CREATE UNIQUE INDEX "MuxData_chapterId_key" ON "MuxData" USING btree ("chapterId" text_ops);
CREATE INDEX "Purchase_courseId_idx" ON "Purchase" USING btree ("courseId" text_ops);
CREATE UNIQUE INDEX "Purchase_userId_courseId_key" ON "Purchase" USING btree ("userId" text_ops,"courseId" text_ops);
CREATE UNIQUE INDEX "StripeCustomer_stripeCustomerId_key" ON "StripeCustomer" USING btree ("stripeCustomerId" text_ops);
CREATE UNIQUE INDEX "StripeCustomer_userId_key" ON "StripeCustomer" USING btree ("userId" text_ops);
CREATE INDEX "UserProgress_chapterId_idx" ON "UserProgress" USING btree ("chapterId" text_ops);
CREATE UNIQUE INDEX "UserProgress_userId_chapterId_key" ON "UserProgress" USING btree ("userId" text_ops,"chapterId" text_ops);

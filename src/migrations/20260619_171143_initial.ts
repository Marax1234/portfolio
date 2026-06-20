import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_videos_status" AS ENUM('processing', 'ready', 'error');
  CREATE TYPE "public"."enum_projects_category" AS ENUM('hochzeiten', 'menschen', 'reisen', 'sport', 'commercial');
  CREATE TYPE "public"."enum_journal_category" AS ENUM('reise', 'sport', 'behind-the-scenes', 'sonstiges');
  CREATE TYPE "public"."enum_contact_submissions_category" AS ENUM('hochzeit', 'reise', 'marke', 'sonstiges');
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "videos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"alt" varchar NOT NULL,
  	"status" "enum_videos_status" DEFAULT 'processing',
  	"hls_url" varchar,
  	"poster_url" varchar,
  	"duration" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "projects_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"category" "enum_projects_category" NOT NULL,
  	"cover_id" integer NOT NULL,
  	"excerpt" varchar,
  	"body" jsonb,
  	"location" varchar,
  	"client" varchar,
  	"featured" boolean DEFAULT false,
  	"cta_label" varchar DEFAULT 'Projekt ansehen',
  	"cta_href" varchar,
  	"order" numeric DEFAULT 0,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "journal_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "journal_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "journal_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "journal_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "journal_blocks_two_column" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"left_id" integer NOT NULL,
  	"left_caption" varchar,
  	"right_id" integer NOT NULL,
  	"right_caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "journal_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"attribution" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "journal_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"poster_id" integer,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "journal" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"category" "enum_journal_category" NOT NULL,
  	"cover_id" integer NOT NULL,
  	"excerpt" varchar,
  	"order" numeric DEFAULT 0,
  	"published_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contact_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"category" "enum_contact_submissions_category" NOT NULL,
  	"message" varchar NOT NULL,
  	"read" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"videos_id" integer,
  	"projects_id" integer,
  	"journal_id" integer,
  	"contact_submissions_id" integer,
  	"documents_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_config_what_i_do_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar DEFAULT '/arbeiten' NOT NULL,
  	"media_id" integer NOT NULL
  );
  
  CREATE TABLE "site_config_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "site_config" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar DEFAULT 'Fotograf & Videograf',
  	"hero_name" varchar DEFAULT 'Kilian Siebert',
  	"hero_tagline" varchar DEFAULT 'Ich filme das, was sich zu erleben lohnt — auf dem Rad genauso wie auf einer Hochzeit.',
  	"hero_scroll_hint" varchar DEFAULT '↓ Scrollen',
  	"hero_poster_id" integer,
  	"hero_video_id" integer,
  	"intro_eyebrow" varchar DEFAULT 'Über mich',
  	"intro_portrait_id" integer,
  	"intro_body" jsonb,
  	"what_i_do_eyebrow" varchar DEFAULT 'Was ich mache',
  	"what_i_do_headline" varchar DEFAULT 'Menschen, Reisen, Sport.',
  	"journal_teaser_eyebrow" varchar DEFAULT 'Aus dem Journal',
  	"journal_teaser_headline" varchar DEFAULT 'Laufende Geschichten.',
  	"cta_left_headline" varchar DEFAULT 'Projekt anfragen.',
  	"cta_left_subline" varchar,
  	"cta_left_button_label" varchar DEFAULT 'Kontakt',
  	"cta_left_button_href" varchar DEFAULT '/kontakt',
  	"cta_right_headline" varchar DEFAULT 'Zusammenarbeiten.',
  	"cta_right_subline" varchar,
  	"cta_right_button_label" varchar DEFAULT 'Kooperationen',
  	"cta_right_button_href" varchar DEFAULT '/kooperationen',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_page_milestones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "about_page_what_defines_me" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"point" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "about_page_backstage" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "about_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar DEFAULT 'Über mich',
  	"hero_headline" varchar DEFAULT 'Kilian Siebert',
  	"hero_image_id" integer,
  	"story" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "cooperations_page_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "cooperations_page_industries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "cooperations_page_reach_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "cooperations_page_prior_cooperations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"note" varchar,
  	"logo_id" integer
  );
  
  CREATE TABLE "cooperations_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro" varchar,
  	"media_kit_id" integer,
  	"media_kit_label" varchar DEFAULT 'Media-Kit herunterladen',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_blocks_text" ADD CONSTRAINT "journal_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."journal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journal_blocks_image" ADD CONSTRAINT "journal_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_blocks_image" ADD CONSTRAINT "journal_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."journal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journal_blocks_gallery_images" ADD CONSTRAINT "journal_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_blocks_gallery_images" ADD CONSTRAINT "journal_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."journal_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journal_blocks_gallery" ADD CONSTRAINT "journal_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."journal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journal_blocks_two_column" ADD CONSTRAINT "journal_blocks_two_column_left_id_media_id_fk" FOREIGN KEY ("left_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_blocks_two_column" ADD CONSTRAINT "journal_blocks_two_column_right_id_media_id_fk" FOREIGN KEY ("right_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_blocks_two_column" ADD CONSTRAINT "journal_blocks_two_column_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."journal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journal_blocks_quote" ADD CONSTRAINT "journal_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."journal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journal_blocks_video" ADD CONSTRAINT "journal_blocks_video_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_blocks_video" ADD CONSTRAINT "journal_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_blocks_video" ADD CONSTRAINT "journal_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."journal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journal" ADD CONSTRAINT "journal_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_journal_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."journal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_submissions_fk" FOREIGN KEY ("contact_submissions_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_config_what_i_do_tiles" ADD CONSTRAINT "site_config_what_i_do_tiles_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_config_what_i_do_tiles" ADD CONSTRAINT "site_config_what_i_do_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_config"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_config_facts" ADD CONSTRAINT "site_config_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_config"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_config" ADD CONSTRAINT "site_config_hero_poster_id_media_id_fk" FOREIGN KEY ("hero_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_config" ADD CONSTRAINT "site_config_hero_video_id_videos_id_fk" FOREIGN KEY ("hero_video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_config" ADD CONSTRAINT "site_config_intro_portrait_id_media_id_fk" FOREIGN KEY ("intro_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_page_milestones" ADD CONSTRAINT "about_page_milestones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_what_defines_me" ADD CONSTRAINT "about_page_what_defines_me_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_backstage" ADD CONSTRAINT "about_page_backstage_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_page_backstage" ADD CONSTRAINT "about_page_backstage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page" ADD CONSTRAINT "about_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cooperations_page_services" ADD CONSTRAINT "cooperations_page_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cooperations_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cooperations_page_industries" ADD CONSTRAINT "cooperations_page_industries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cooperations_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cooperations_page_reach_facts" ADD CONSTRAINT "cooperations_page_reach_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cooperations_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cooperations_page_prior_cooperations" ADD CONSTRAINT "cooperations_page_prior_cooperations_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cooperations_page_prior_cooperations" ADD CONSTRAINT "cooperations_page_prior_cooperations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cooperations_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cooperations_page" ADD CONSTRAINT "cooperations_page_media_kit_id_documents_id_fk" FOREIGN KEY ("media_kit_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "videos_updated_at_idx" ON "videos" USING btree ("updated_at");
  CREATE INDEX "videos_created_at_idx" ON "videos" USING btree ("created_at");
  CREATE UNIQUE INDEX "videos_filename_idx" ON "videos" USING btree ("filename");
  CREATE INDEX "projects_gallery_order_idx" ON "projects_gallery" USING btree ("_order");
  CREATE INDEX "projects_gallery_parent_id_idx" ON "projects_gallery" USING btree ("_parent_id");
  CREATE INDEX "projects_gallery_image_idx" ON "projects_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_cover_idx" ON "projects" USING btree ("cover_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "journal_blocks_text_order_idx" ON "journal_blocks_text" USING btree ("_order");
  CREATE INDEX "journal_blocks_text_parent_id_idx" ON "journal_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "journal_blocks_text_path_idx" ON "journal_blocks_text" USING btree ("_path");
  CREATE INDEX "journal_blocks_image_order_idx" ON "journal_blocks_image" USING btree ("_order");
  CREATE INDEX "journal_blocks_image_parent_id_idx" ON "journal_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "journal_blocks_image_path_idx" ON "journal_blocks_image" USING btree ("_path");
  CREATE INDEX "journal_blocks_image_image_idx" ON "journal_blocks_image" USING btree ("image_id");
  CREATE INDEX "journal_blocks_gallery_images_order_idx" ON "journal_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "journal_blocks_gallery_images_parent_id_idx" ON "journal_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "journal_blocks_gallery_images_image_idx" ON "journal_blocks_gallery_images" USING btree ("image_id");
  CREATE INDEX "journal_blocks_gallery_order_idx" ON "journal_blocks_gallery" USING btree ("_order");
  CREATE INDEX "journal_blocks_gallery_parent_id_idx" ON "journal_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "journal_blocks_gallery_path_idx" ON "journal_blocks_gallery" USING btree ("_path");
  CREATE INDEX "journal_blocks_two_column_order_idx" ON "journal_blocks_two_column" USING btree ("_order");
  CREATE INDEX "journal_blocks_two_column_parent_id_idx" ON "journal_blocks_two_column" USING btree ("_parent_id");
  CREATE INDEX "journal_blocks_two_column_path_idx" ON "journal_blocks_two_column" USING btree ("_path");
  CREATE INDEX "journal_blocks_two_column_left_idx" ON "journal_blocks_two_column" USING btree ("left_id");
  CREATE INDEX "journal_blocks_two_column_right_idx" ON "journal_blocks_two_column" USING btree ("right_id");
  CREATE INDEX "journal_blocks_quote_order_idx" ON "journal_blocks_quote" USING btree ("_order");
  CREATE INDEX "journal_blocks_quote_parent_id_idx" ON "journal_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "journal_blocks_quote_path_idx" ON "journal_blocks_quote" USING btree ("_path");
  CREATE INDEX "journal_blocks_video_order_idx" ON "journal_blocks_video" USING btree ("_order");
  CREATE INDEX "journal_blocks_video_parent_id_idx" ON "journal_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "journal_blocks_video_path_idx" ON "journal_blocks_video" USING btree ("_path");
  CREATE INDEX "journal_blocks_video_video_idx" ON "journal_blocks_video" USING btree ("video_id");
  CREATE INDEX "journal_blocks_video_poster_idx" ON "journal_blocks_video" USING btree ("poster_id");
  CREATE UNIQUE INDEX "journal_slug_idx" ON "journal" USING btree ("slug");
  CREATE INDEX "journal_cover_idx" ON "journal" USING btree ("cover_id");
  CREATE INDEX "journal_updated_at_idx" ON "journal" USING btree ("updated_at");
  CREATE INDEX "journal_created_at_idx" ON "journal" USING btree ("created_at");
  CREATE INDEX "contact_submissions_updated_at_idx" ON "contact_submissions" USING btree ("updated_at");
  CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions" USING btree ("created_at");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "documents" USING btree ("filename");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_videos_id_idx" ON "payload_locked_documents_rels" USING btree ("videos_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_journal_id_idx" ON "payload_locked_documents_rels" USING btree ("journal_id");
  CREATE INDEX "payload_locked_documents_rels_contact_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_config_what_i_do_tiles_order_idx" ON "site_config_what_i_do_tiles" USING btree ("_order");
  CREATE INDEX "site_config_what_i_do_tiles_parent_id_idx" ON "site_config_what_i_do_tiles" USING btree ("_parent_id");
  CREATE INDEX "site_config_what_i_do_tiles_media_idx" ON "site_config_what_i_do_tiles" USING btree ("media_id");
  CREATE INDEX "site_config_facts_order_idx" ON "site_config_facts" USING btree ("_order");
  CREATE INDEX "site_config_facts_parent_id_idx" ON "site_config_facts" USING btree ("_parent_id");
  CREATE INDEX "site_config_hero_hero_poster_idx" ON "site_config" USING btree ("hero_poster_id");
  CREATE INDEX "site_config_hero_hero_video_idx" ON "site_config" USING btree ("hero_video_id");
  CREATE INDEX "site_config_intro_intro_portrait_idx" ON "site_config" USING btree ("intro_portrait_id");
  CREATE INDEX "about_page_milestones_order_idx" ON "about_page_milestones" USING btree ("_order");
  CREATE INDEX "about_page_milestones_parent_id_idx" ON "about_page_milestones" USING btree ("_parent_id");
  CREATE INDEX "about_page_what_defines_me_order_idx" ON "about_page_what_defines_me" USING btree ("_order");
  CREATE INDEX "about_page_what_defines_me_parent_id_idx" ON "about_page_what_defines_me" USING btree ("_parent_id");
  CREATE INDEX "about_page_backstage_order_idx" ON "about_page_backstage" USING btree ("_order");
  CREATE INDEX "about_page_backstage_parent_id_idx" ON "about_page_backstage" USING btree ("_parent_id");
  CREATE INDEX "about_page_backstage_image_idx" ON "about_page_backstage" USING btree ("image_id");
  CREATE INDEX "about_page_hero_hero_image_idx" ON "about_page" USING btree ("hero_image_id");
  CREATE INDEX "cooperations_page_services_order_idx" ON "cooperations_page_services" USING btree ("_order");
  CREATE INDEX "cooperations_page_services_parent_id_idx" ON "cooperations_page_services" USING btree ("_parent_id");
  CREATE INDEX "cooperations_page_industries_order_idx" ON "cooperations_page_industries" USING btree ("_order");
  CREATE INDEX "cooperations_page_industries_parent_id_idx" ON "cooperations_page_industries" USING btree ("_parent_id");
  CREATE INDEX "cooperations_page_reach_facts_order_idx" ON "cooperations_page_reach_facts" USING btree ("_order");
  CREATE INDEX "cooperations_page_reach_facts_parent_id_idx" ON "cooperations_page_reach_facts" USING btree ("_parent_id");
  CREATE INDEX "cooperations_page_prior_cooperations_order_idx" ON "cooperations_page_prior_cooperations" USING btree ("_order");
  CREATE INDEX "cooperations_page_prior_cooperations_parent_id_idx" ON "cooperations_page_prior_cooperations" USING btree ("_parent_id");
  CREATE INDEX "cooperations_page_prior_cooperations_logo_idx" ON "cooperations_page_prior_cooperations" USING btree ("logo_id");
  CREATE INDEX "cooperations_page_media_kit_idx" ON "cooperations_page" USING btree ("media_kit_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "videos" CASCADE;
  DROP TABLE "projects_gallery" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "journal_blocks_text" CASCADE;
  DROP TABLE "journal_blocks_image" CASCADE;
  DROP TABLE "journal_blocks_gallery_images" CASCADE;
  DROP TABLE "journal_blocks_gallery" CASCADE;
  DROP TABLE "journal_blocks_two_column" CASCADE;
  DROP TABLE "journal_blocks_quote" CASCADE;
  DROP TABLE "journal_blocks_video" CASCADE;
  DROP TABLE "journal" CASCADE;
  DROP TABLE "contact_submissions" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_config_what_i_do_tiles" CASCADE;
  DROP TABLE "site_config_facts" CASCADE;
  DROP TABLE "site_config" CASCADE;
  DROP TABLE "about_page_milestones" CASCADE;
  DROP TABLE "about_page_what_defines_me" CASCADE;
  DROP TABLE "about_page_backstage" CASCADE;
  DROP TABLE "about_page" CASCADE;
  DROP TABLE "cooperations_page_services" CASCADE;
  DROP TABLE "cooperations_page_industries" CASCADE;
  DROP TABLE "cooperations_page_reach_facts" CASCADE;
  DROP TABLE "cooperations_page_prior_cooperations" CASCADE;
  DROP TABLE "cooperations_page" CASCADE;
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_videos_status";
  DROP TYPE "public"."enum_projects_category";
  DROP TYPE "public"."enum_journal_category";
  DROP TYPE "public"."enum_contact_submissions_category";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_config_hero_posters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  ALTER TABLE "site_config" DROP CONSTRAINT "site_config_hero_poster_id_media_id_fk";
  
  DROP INDEX "site_config_hero_hero_poster_idx";
  ALTER TABLE "site_config_what_i_do_tiles" ADD COLUMN "media_color_id" integer;
  ALTER TABLE "site_config_hero_posters" ADD CONSTRAINT "site_config_hero_posters_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_config_hero_posters" ADD CONSTRAINT "site_config_hero_posters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_config"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_config_hero_posters_order_idx" ON "site_config_hero_posters" USING btree ("_order");
  CREATE INDEX "site_config_hero_posters_parent_id_idx" ON "site_config_hero_posters" USING btree ("_parent_id");
  CREATE INDEX "site_config_hero_posters_image_idx" ON "site_config_hero_posters" USING btree ("image_id");
  ALTER TABLE "site_config_what_i_do_tiles" ADD CONSTRAINT "site_config_what_i_do_tiles_media_color_id_media_id_fk" FOREIGN KEY ("media_color_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_config_what_i_do_tiles_media_color_idx" ON "site_config_what_i_do_tiles" USING btree ("media_color_id");
  ALTER TABLE "site_config" DROP COLUMN "hero_poster_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_config_hero_posters" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_config_hero_posters" CASCADE;
  ALTER TABLE "site_config_what_i_do_tiles" DROP CONSTRAINT "site_config_what_i_do_tiles_media_color_id_media_id_fk";
  
  DROP INDEX "site_config_what_i_do_tiles_media_color_idx";
  ALTER TABLE "site_config" ADD COLUMN "hero_poster_id" integer;
  ALTER TABLE "site_config" ADD CONSTRAINT "site_config_hero_poster_id_media_id_fk" FOREIGN KEY ("hero_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_config_hero_hero_poster_idx" ON "site_config" USING btree ("hero_poster_id");
  ALTER TABLE "site_config_what_i_do_tiles" DROP COLUMN "media_color_id";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "about_page_backstage" ADD COLUMN "period" varchar;
   ALTER TABLE "about_page_backstage" ADD COLUMN "caption" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "about_page_backstage" DROP COLUMN "period";
   ALTER TABLE "about_page_backstage" DROP COLUMN "caption";`)
}

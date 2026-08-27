/*
  Warnings:

  - You are about to drop the `project_progress_updates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "project_progress_updates" DROP CONSTRAINT "project_progress_updates_project_id_fkey";

-- DropForeignKey
ALTER TABLE "project_progress_updates" DROP CONSTRAINT "project_progress_updates_updated_by_id_fkey";

-- DropTable
DROP TABLE "project_progress_updates";

-- CreateTable
CREATE TABLE "project_checklist_items" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMPTZ,
    "completed_by_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "project_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_checklist_item_photos" (
    "id" UUID NOT NULL,
    "checklist_item_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_checklist_item_photos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_checklist_items" ADD CONSTRAINT "project_checklist_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_checklist_items" ADD CONSTRAINT "project_checklist_items_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_checklist_item_photos" ADD CONSTRAINT "project_checklist_item_photos_checklist_item_id_fkey" FOREIGN KEY ("checklist_item_id") REFERENCES "project_checklist_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

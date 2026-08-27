-- AlterTable
ALTER TABLE "project_checklist_items" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "house_design_steps" (
    "id" UUID NOT NULL,
    "house_design_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "house_design_steps_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "house_design_steps" ADD CONSTRAINT "house_design_steps_house_design_id_fkey" FOREIGN KEY ("house_design_id") REFERENCES "house_designs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "house_design_id" UUID;

-- CreateTable
CREATE TABLE "house_designs" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "base_price" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "house_designs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_house_design_id_fkey" FOREIGN KEY ("house_design_id") REFERENCES "house_designs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

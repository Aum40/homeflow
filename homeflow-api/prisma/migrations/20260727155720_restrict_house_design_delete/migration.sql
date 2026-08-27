-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_house_design_id_fkey";

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_house_design_id_fkey" FOREIGN KEY ("house_design_id") REFERENCES "house_designs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `parentId` on the `files` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_parentId_fkey";

-- AlterTable
ALTER TABLE "files" DROP COLUMN "parentId",
ADD COLUMN     "parentID" TEXT;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_parentID_fkey" FOREIGN KEY ("parentID") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

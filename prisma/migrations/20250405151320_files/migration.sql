/*
  Warnings:

  - Added the required column `spaceID` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" ADD COLUMN     "spaceID" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_spaceID_fkey" FOREIGN KEY ("spaceID") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

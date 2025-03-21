/*
  Warnings:

  - You are about to drop the column `ownerId` on the `notes` table. All the data in the column will be lost.
  - Added the required column `ownerID` to the `notes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_ownerId_fkey";

-- AlterTable
ALTER TABLE "notes" DROP COLUMN "ownerId",
ADD COLUMN     "ownerID" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

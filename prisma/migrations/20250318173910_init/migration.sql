/*
  Warnings:

  - The `days` column on the `calendar_events` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "calendar_events" DROP COLUMN "days",
ADD COLUMN     "days" INTEGER[];

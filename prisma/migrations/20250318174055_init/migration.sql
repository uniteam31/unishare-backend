/*
  Warnings:

  - You are about to drop the column `spaceID` on the `calendar_events` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "calendar_events" DROP CONSTRAINT "calendar_events_spaceID_fkey";

-- AlterTable
ALTER TABLE "calendar_events" DROP COLUMN "spaceID";

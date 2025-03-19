/*
  Warnings:

  - You are about to drop the `CalendarEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CalendarEvent" DROP CONSTRAINT "CalendarEvent_ownerID_fkey";

-- DropForeignKey
ALTER TABLE "CalendarEvent" DROP CONSTRAINT "CalendarEvent_spaceID_fkey";

-- DropTable
DROP TABLE "CalendarEvent";

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "interval" INTEGER,
    "period" "EventPeriod" NOT NULL,
    "days" INTEGER,
    "ownerID" TEXT NOT NULL,
    "spaceID" TEXT NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_spaceID_fkey" FOREIGN KEY ("spaceID") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

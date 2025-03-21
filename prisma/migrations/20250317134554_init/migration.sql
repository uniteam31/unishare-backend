-- CreateEnum
CREATE TYPE "EventPeriod" AS ENUM ('DAY', 'WEEK', 'MONTH', 'YEAR');

-- CreateTable
CREATE TABLE "CalendarEvent" (
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

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_spaceID_fkey" FOREIGN KEY ("spaceID") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `UserServiceInfo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserServiceInfo" DROP CONSTRAINT "UserServiceInfo_userID_fkey";

-- DropTable
DROP TABLE "UserServiceInfo";

-- CreateTable
CREATE TABLE "user_service_info" (
    "userID" TEXT NOT NULL,
    "isInited" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_service_info_pkey" PRIMARY KEY ("userID")
);

-- AddForeignKey
ALTER TABLE "user_service_info" ADD CONSTRAINT "user_service_info_userID_fkey" FOREIGN KEY ("userID") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

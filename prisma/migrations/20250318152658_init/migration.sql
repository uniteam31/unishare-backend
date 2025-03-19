/*
  Warnings:

  - The values [PIBLIC] on the enum `SpaceType` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `friends_requests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `friends_requests` table. All the data in the column will be lost.
  - You are about to drop the `_Friends` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SpaceType_new" AS ENUM ('PUBLIC', 'PRIVATE', 'PERSONAL');
ALTER TABLE "spaces" ALTER COLUMN "type" TYPE "SpaceType_new" USING ("type"::text::"SpaceType_new");
ALTER TYPE "SpaceType" RENAME TO "SpaceType_old";
ALTER TYPE "SpaceType_new" RENAME TO "SpaceType";
DROP TYPE "SpaceType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "_Friends" DROP CONSTRAINT "_Friends_A_fkey";

-- DropForeignKey
ALTER TABLE "_Friends" DROP CONSTRAINT "_Friends_B_fkey";

-- AlterTable
ALTER TABLE "friends_requests" DROP CONSTRAINT "friends_requests_pkey",
DROP COLUMN "id";

-- DropTable
DROP TABLE "_Friends";

-- CreateTable
CREATE TABLE "friends" (
    "senderUserID" TEXT NOT NULL,
    "accepterUserID" TEXT NOT NULL,

    CONSTRAINT "friends_pkey" PRIMARY KEY ("senderUserID","accepterUserID")
);

-- CreateTable
CREATE TABLE "_UserFriends" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserFriends_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserFriends_B_index" ON "_UserFriends"("B");

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_senderUserID_fkey" FOREIGN KEY ("senderUserID") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_accepterUserID_fkey" FOREIGN KEY ("accepterUserID") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFriends" ADD CONSTRAINT "_UserFriends_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFriends" ADD CONSTRAINT "_UserFriends_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

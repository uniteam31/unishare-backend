-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_userID_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "userID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_userID_fkey" FOREIGN KEY ("userID") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

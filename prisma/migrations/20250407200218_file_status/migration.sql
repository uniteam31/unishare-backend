-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('PENDING', 'UPLOADED', 'DELETED');

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "status" "FileStatus";

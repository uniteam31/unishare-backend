-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_id_fkey";

-- CreateTable
CREATE TABLE "Friend" (
    "userID" TEXT NOT NULL,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("userID")
);

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_userID_fkey" FOREIGN KEY ("userID") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

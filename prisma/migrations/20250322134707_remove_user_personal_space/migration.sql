-- CreateTable
CREATE TABLE "UserServiceInfo" (
    "userID" TEXT NOT NULL,

    CONSTRAINT "UserServiceInfo_pkey" PRIMARY KEY ("userID")
);

-- AddForeignKey
ALTER TABLE "UserServiceInfo" ADD CONSTRAINT "UserServiceInfo_userID_fkey" FOREIGN KEY ("userID") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

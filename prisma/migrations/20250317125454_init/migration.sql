-- CreateEnum
CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SpaceType" AS ENUM ('PIBLIC', 'PRIVATE', 'PERSONAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "educationalEmail" TEXT,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT DEFAULT 'https://avatars.mds.yandex.net/i?id=29f7366ac823f46165612d9480e60f0e_l-13215132-images-thumbs&n=13',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friends_requests" (
    "id" TEXT NOT NULL,
    "fromUserID" TEXT NOT NULL,
    "toUserID" TEXT NOT NULL,
    "status" "FriendRequestStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "friends_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerID" TEXT NOT NULL,
    "type" "SpaceType" NOT NULL,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_members" (
    "userID" TEXT NOT NULL,
    "spaceID" TEXT NOT NULL,

    CONSTRAINT "space_members_pkey" PRIMARY KEY ("userID","spaceID")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "text" TEXT,
    "ownerId" TEXT NOT NULL,
    "spaceID" TEXT NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_educationalEmail_key" ON "users"("educationalEmail");

-- CreateIndex
CREATE UNIQUE INDEX "friends_requests_fromUserID_toUserID_key" ON "friends_requests"("fromUserID", "toUserID");

-- CreateIndex
CREATE UNIQUE INDEX "spaces_ownerID_key" ON "spaces"("ownerID");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_userID_fkey" FOREIGN KEY ("userID") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends_requests" ADD CONSTRAINT "friends_requests_fromUserID_fkey" FOREIGN KEY ("fromUserID") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends_requests" ADD CONSTRAINT "friends_requests_toUserID_fkey" FOREIGN KEY ("toUserID") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_userID_fkey" FOREIGN KEY ("userID") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_spaceID_fkey" FOREIGN KEY ("spaceID") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_spaceID_fkey" FOREIGN KEY ("spaceID") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

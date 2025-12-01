/*
  Warnings:

  - The primary key for the `about_sections` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `hero_sections` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `logoUrl` on the `hero_sections` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `about_sections` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `hero_sections` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `about_sections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `contact_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `hero_sections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "about_sections" DROP CONSTRAINT "about_sections_pkey",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "about_sections_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "contact_requests" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "hero_sections" DROP CONSTRAINT "hero_sections_pkey",
DROP COLUMN "logoUrl",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "hero_sections_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "about_sections_userId_key" ON "about_sections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "hero_sections_userId_key" ON "hero_sections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_sections" ADD CONSTRAINT "hero_sections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_sections" ADD CONSTRAINT "about_sections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `SocketConnections` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Socket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SocketConnections" DROP CONSTRAINT "SocketConnections_socketId_fkey";

-- DropForeignKey
ALTER TABLE "SocketConnections" DROP CONSTRAINT "SocketConnections_userId_fkey";

-- AlterTable
ALTER TABLE "Socket" ADD COLUMN     "userId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "SocketConnections";

-- AddForeignKey
ALTER TABLE "Socket" ADD CONSTRAINT "Socket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

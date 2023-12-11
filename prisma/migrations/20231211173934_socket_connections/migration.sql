-- CreateTable
CREATE TABLE "Socket" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Socket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocketConnections" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "socketId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SocketConnections_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SocketConnections" ADD CONSTRAINT "SocketConnections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocketConnections" ADD CONSTRAINT "SocketConnections_socketId_fkey" FOREIGN KEY ("socketId") REFERENCES "Socket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

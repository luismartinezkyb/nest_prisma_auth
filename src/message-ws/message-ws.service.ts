import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Socket } from 'socket.io';
import { DbService } from 'src/db/db.service';
import { Socket as SocketModel } from '@prisma/client';

interface ConnectedClient {
  [id: string]: {
    socket: Socket;
    user: User;
  };
}

@Injectable()
export class MessageWsService {
  private connectedClients: ConnectedClient = {};

  constructor(private dbService: DbService) {}

  async registerClient(client: Socket, userId: string) {
    const user = await this.dbService.user.findUnique({
      where: { id: +userId },
    });
    if (!user) throw new Error('USER_NOT_FOUND');
    if (!user.isActive) throw new Error('USER_NOT_ACTIVE');

    await this.checkUserConnection(user, client);

    const socket = await this.dbService.socket.create({
      data: {
        userId: user.id,
        isActive: true,
        id: client.id,
      },
    });
    if (!socket) throw new Error('SOCKET_FAILED');
    this.connectedClients[client.id] = {
      socket: client,
      user: user,
    };
  }
  async removeClient(clientId: string) {
    const socket = await this.findSocketConnection(clientId);
    if (!socket) return null;
    this.dbService.socket.update({
      where: {
        id: socket.id,
      },
      data: {
        isActive: false,
      },
    });

    delete this.connectedClients[clientId];
  }
  async getConnectedClients(): Promise<SocketModel[]> {
    const connectedClients = await this.dbService.socket.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });
    // console.log(connectedClients);
    return connectedClients;
    // return Object.keys(this.connectedClients);
  }

  async getUserFullname(socketId: string) {
    const socket = await this.dbService.socket.findUnique({
      where: {
        id: socketId,
      },
      include: {
        user: true,
      },
    });
    return socket.user.fullName;
    // return this.connectedClients[socketId].user.fullName;
  }
  private async findSocketConnection(socketId: string) {
    return await this.dbService.socket.findFirst({
      where: {
        id: socketId,
      },
    });
  }
  private async checkUserConnection(user: User, client: Socket) {
    const socket = await this.dbService.socket.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
    });

    if (socket) {
      // client.disconnect();
      // console.log('SOCKETS CLIENTES', this.connectedClients[socket.id]);
      // console.log(this.connectedClients);
      await this.dbService.socket.update({
        where: {
          id: socket.id,
        },
        data: {
          isActive: false,
        },
      });
      if (this.connectedClients[socket.id]) {
        this.connectedClients[socket.id].socket.disconnect();
      }
    }
  }
}

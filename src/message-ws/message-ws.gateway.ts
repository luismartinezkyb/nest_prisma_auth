import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interfaces';

@WebSocketGateway({
  crossOriginIsolated: true,
  cors: true,
})
export class MessageWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;
  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    try {
      //OBtengo el payload y se lo mando al register
      const payload: JwtPayload = this.jwtService.verify(token);
      //Mando llamar el servicio para iniciar el socket de un cliente
      await this.messageWsService.registerClient(client, payload.id);
    } catch (error) {
      console.log(error);
      client.disconnect();
      throw new WsException('Error with ws jwt authentication');
    }
    this.wss.emit(
      'clients-updated',
      await this.messageWsService.getConnectedClients(),
    );
    // client.join('ventas');
  }
  async handleDisconnect(client: Socket) {
    await this.messageWsService.removeClient(client.id);
    // console.log({ conectados: this.messageWsService.getConnectedClients() });
    this.wss.emit(
      'clients-updated',
      await this.messageWsService.getConnectedClients(),
    );
  }

  @SubscribeMessage('message-frrom-client')
  async onMessageFromCLient(client: Socket, payload: NewMessageDto) {
    //EMITMESAGE
    // console.log(client.id, payload.message);

    //EMITE SOLO AL CLIENTE QUE LLEGO
    // client.emit('messages-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'New Message',
    // });

    //EMITIR A TODOS MNOS AL CLINTE
    // client.broadcast.emit('messages-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'New Message',
    // });

    //EMITIRPARA TODOS
    this.wss.emit('messages-from-server', {
      fullName: await this.messageWsService.getUserFullname(client.id),
      message: payload.message || 'New Message',
    });

    //SOLO A UN GRUPO join
    // this.wss.to('ventas').emit('evento-name', { data: 'hola' });
  }
}

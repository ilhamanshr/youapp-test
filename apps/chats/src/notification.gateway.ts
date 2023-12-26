import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class NotificationGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationGateway.name);

  @SubscribeMessage('join')
  joinRoom(
    @MessageBody() payload: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!payload.chatId) {
      client.emit('joined', 'chatId is requried');
    } else {
      client.join(payload.chatId);
      this.logger.log(`${client.id} is joining room ${payload.chatId}`);
      this.server
        .to(payload.chatId)
        .emit('joined', `${client.id} is joining room ${payload.chatId}`);
    }
  }

  @SubscribeMessage('leave')
  leaveRoom(
    @MessageBody() payload: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!payload.chatId) {
      client.emit('leaved', 'chatId is requried');
    } else {
      client.leave(payload.chatId);
      this.logger.log(`${client.id} is leaving room ${payload.chatId}`);
      this.server
        .to(payload.chatId)
        .emit('leaved', `${client.id} is leaving room ${payload.chatId}`);
    }
  }

  @SubscribeMessage('typing')
  typing() {
    //TODO
  }
}

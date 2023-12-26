import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatRepository } from './repository/chat.repository';
import { SendMessageDto } from './dto/send-message.dto';
import { Types } from 'mongoose';
import { USERS_SERVICE } from './constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ViewMessagesDto } from './dto/view-messages.dto';
import { map, omit, pick } from 'lodash';
import { ConversationRepository } from './repository/conversation.repository';
import { Conversation } from './entities/conversation.entity';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class ChatsService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly conversationRepository: ConversationRepository,
    private readonly notificationGateway: NotificationGateway,
    @Inject(USERS_SERVICE) private usersClient: ClientProxy,
  ) {}

  getHello(): string {
    return 'Welcome to Chats API!';
  }

  async sendMessage(payload: SendMessageDto, user: any): Promise<Conversation> {
    const { to } = payload;
    if (to == user._id)
      throw new ForbiddenException(`You can't chat with yourself`);

    const checkSourceData = { _id: user._id, auth: 0 };
    const checkDestinationData = { _id: to, auth: 0 };
    payload['from'] = new Types.ObjectId(user._id);
    payload['to'] = new Types.ObjectId(to);

    const [isChatsExists, fromUser, toUser] = await Promise.all([
      this.chatRepository.findOrCreate(payload['from'], payload['to']),
      this.checkUserExistance(checkSourceData),
      this.checkUserExistance(checkDestinationData),
    ]);
    const chatId = isChatsExists._id;
    payload['chat_id'] = chatId;

    const result = await this.conversationRepository.create(payload);
    result.from = pick(fromUser, ['_id', 'username', 'email', 'name']) as any;
    result.to = pick(toUser, ['_id', 'username', 'email', 'name']) as any;
    this.notificationGateway.server
      .to(chatId.toString())
      .emit('newMessage', result);
    return result;
  }

  async viewMessages(
    id: string,
    user: any,
    query: ViewMessagesDto,
  ): Promise<{ chatId: string; datas: Conversation[]; total: number }> {
    if (id == user._id)
      throw new ForbiddenException(`You can't chat with yourself`);

    const { page, limit, clientId } = query;
    const checkSourceData = { _id: user._id, auth: 0 };
    const checkDestinationData = { _id: id, auth: 0 };
    const idSource = new Types.ObjectId(user._id);
    const idDestination = new Types.ObjectId(id);

    const [isChatsExists] = await Promise.all([
      this.chatRepository.findOrCreate(idDestination, idSource),
      this.checkUserExistance(checkSourceData),
      this.checkUserExistance(checkDestinationData),
    ]);
    const chatId = isChatsExists._id;
    const filter = { chat_id: isChatsExists._id };
    const sort = { created_at: -1 };

    const { datas, total } = await this.conversationRepository.getList(
      filter,
      sort,
      page,
      limit,
    );

    const dataDetails = await Promise.all(
      map(datas, async (message) => {
        const checkSourceData = { _id: message.from, auth: 0 };
        const checkDestinationData = { _id: message.to, auth: 0 };
        const [userSourceInfo, userDestinationInfo] = await Promise.all([
          this.checkUserExistance(checkSourceData),
          this.checkUserExistance(checkDestinationData),
        ]);

        message.from = pick(userSourceInfo, [
          '_id',
          'username',
          'email',
          'name',
        ]) as any;
        message.to = pick(userDestinationInfo, [
          '_id',
          'username',
          'email',
          'name',
        ]) as any;
        return omit(message, ['chat_id', 'updated_by']) as Conversation;
      }),
    );
    const result = { chatId, datas: dataDetails, total };
    this.notificationGateway.server.to(clientId).emit('viewMessages', result);
    return result;
  }

  async checkUserExistance(emitData: any) {
    const toUser = await lastValueFrom(
      this.usersClient.send('user-detail', emitData),
    );

    if (!toUser) {
      throw new NotFoundException(`User with id ${emitData._id} is not found`);
    }

    if ('status' in toUser && toUser.status === 404) {
      throw new NotFoundException(`User with id ${emitData._id} is not found`);
    }

    return toUser;
  }
}

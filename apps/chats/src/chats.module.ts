import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { DatabaseModule, RmqModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { ChatRepository } from './repository/chat.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './entities/chat.entity';
import { JwtStrategy } from './strategies/jwt-strategy';
import { USERS_SERVICE } from './constants/services';
import { NotificationGateway } from './notification.gateway';
import {
  Conversation,
  ConversationSchema,
} from './entities/conversation.entity';
import { ConversationRepository } from './repository/conversation.repository';

@Module({
  imports: [
    RmqModule.register({
      name: USERS_SERVICE,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        APP_PORT: Joi.number().required(),
        MONGODB_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_CHATS_QUEUE: Joi.string().required(),
        RABBIT_MQ_USERS_QUEUE: Joi.string().required(),
      }),
      envFilePath: './apps/chats/.env',
    }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
  ],
  controllers: [ChatsController],
  providers: [
    ChatsService,
    ChatRepository,
    ConversationRepository,
    NotificationGateway,
    JwtStrategy,
  ],
})
export class ChatsModule {}

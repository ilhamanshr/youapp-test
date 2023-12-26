import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from '../entities/chat.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectModel(Chat.name)
    private readonly ChatModel: Model<ChatDocument>,
  ) {}

  async findOrCreate(from: Types.ObjectId, to: Types.ObjectId): Promise<Chat> {
    const member = [from, to];
    const existingUser = await this.ChatModel.findOne({
      member: { $all: member },
    }).exec();

    if (existingUser) {
      return existingUser;
    }

    const newUser = new this.ChatModel({ member });
    return newUser.save();
  }
}

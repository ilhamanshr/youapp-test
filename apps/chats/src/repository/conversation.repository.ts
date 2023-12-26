import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SendMessageDto } from '../dto/send-message.dto';
import {
  Conversation,
  ConversationDocument,
} from '../entities/conversation.entity';

@Injectable()
export class ConversationRepository {
  constructor(
    @InjectModel(Conversation.name)
    private readonly ConversationModel: Model<ConversationDocument>,
  ) {}

  async create(payload: SendMessageDto): Promise<Conversation> {
    const conversation = new this.ConversationModel(payload);
    try {
      return await conversation.save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getList(
    filter: FilterQuery<Conversation>,
    sort: Record<string, any>,
    page: number,
    limit: number,
  ): Promise<{ datas: Conversation[]; total: number }> {
    const query = this.ConversationModel.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const [datas, total] = await Promise.all([
      query.lean().exec(),
      this.ConversationModel.countDocuments(filter),
    ]);

    return { datas, total };
  }
}

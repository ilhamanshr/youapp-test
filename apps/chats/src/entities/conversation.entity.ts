import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Conversation extends Document {
  @Prop({ required: true })
  from: Types.ObjectId;

  @Prop({ required: true, ref: 'Chat' })
  chat_id: Types.ObjectId;

  @Prop({ required: true })
  to: Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop({ default: Date.now })
  created_at: Date;
}

export type ConversationDocument = Conversation & Document;
export const ConversationSchema = SchemaFactory.createForClass(Conversation);

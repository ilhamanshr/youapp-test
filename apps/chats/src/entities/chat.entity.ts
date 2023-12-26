import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Chat extends Document {
  @Prop({ required: true })
  member: Types.ObjectId[];

  @Prop({ default: Date.now })
  created_at: Date;
}

export type ChatDocument = Chat & Document;
export const ChatSchema = SchemaFactory.createForClass(Chat);

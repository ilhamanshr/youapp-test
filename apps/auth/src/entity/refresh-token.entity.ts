import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
// import { User } from '../../user/entities/user.entity';

@Schema()
export class RefreshTokens extends Document {
  @Prop()
  isRevoke: boolean;

  @Prop()
  expired_at: Date;

  // @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  // user: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;
}

export type RefreshTokensDocument = RefreshTokens & Document;
export const RefreshTokensSchema = SchemaFactory.createForClass(RefreshTokens);

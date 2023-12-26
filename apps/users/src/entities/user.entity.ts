import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, select: false })
  salt: string;

  @Prop({ default: null })
  name: string;

  @Prop({ default: null })
  gender: string;

  @Prop({ default: null })
  date_of_birth: string;

  @Prop({ default: null })
  horoscope: string;

  @Prop({ default: null })
  zodiac: string;

  @Prop({ default: null })
  height: string;

  @Prop({ default: null })
  weight: string;

  @Prop({ default: null })
  profilePicture: string;

  @Prop({ type: [String], default: [] })
  interests: string[];
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

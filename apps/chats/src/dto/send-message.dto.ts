import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class SendMessageDto {
  @IsNotEmpty()
  @IsMongoId()
  to: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  message: string;
}

import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class ViewMessagesDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit: number;

  @IsNotEmpty()
  @IsString()
  clientId: string;
}

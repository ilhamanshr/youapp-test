import { IsMongoId, IsNotEmpty, Max, Min } from 'class-validator';

export class UserDetailDto {
  @IsNotEmpty()
  @IsMongoId()
  _id: string;

  @IsNotEmpty()
  @Min(0)
  @Max(1)
  auth: number;
}

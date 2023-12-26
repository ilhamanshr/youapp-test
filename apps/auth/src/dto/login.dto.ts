import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  userIdentity: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

import { IsDateString, IsNotEmpty } from 'class-validator';

export class CreateProfileDto {
  @IsNotEmpty()
  @IsDateString()
  date_of_birth: string;
}

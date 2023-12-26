import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { GenderEnum } from '../enum/gender.enum';
import { HoroscopeEnum } from '../enum/horoscope.enum';
import { ZodiacEnum } from '../enum/zodiac.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'name is too short' })
  @MaxLength(50, { message: 'name is too long' })
  name: string;

  @IsOptional()
  @IsString()
  @IsEnum(GenderEnum)
  gender: string;

  @IsOptional()
  @IsDateString()
  date_of_birth: string;

  @IsOptional()
  @IsString()
  @IsEnum(HoroscopeEnum)
  horoscope: string;

  @IsOptional()
  @IsString()
  @IsEnum(ZodiacEnum)
  zodiac: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+(\.\d+)?\s(cm|in)$/, {
    message: 'Invalid height format. Use cm or in.',
  })
  height: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+(\.\d+)?\s(kg|lbs)$/, {
    message: 'Invalid weight format. Use kg or lbs.',
  })
  weight: string;

  @IsOptional()
  @IsArray()
  interests: string[];
}

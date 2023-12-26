import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class UserIdValidation implements PipeTransform {
  transform(value: any): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException('Param id must be valid object id');
    }

    return value;
  }
}

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../entities/user.entity';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly UserModel: Model<UserDocument>,
  ) {}

  async getUserById(id: string): Promise<User> {
    return await this.UserModel.findOne({ _id: id });
  }

  async validateUser(userIdentity: string, password: string): Promise<User> {
    const user = await this.UserModel.findOne({
      $or: [{ username: userIdentity }, { email: userIdentity }],
    }).select('+password +salt');
    if (user) {
      const hash = await bcrypt.hash(password, user.salt);
      if (hash === user.password) return user;
    }
    return null;
  }

  async create(payload: CreateUserDto): Promise<User> {
    const { username, email } = payload;
    const user = new this.UserModel(payload);
    await this.isEmailExist(email);
    await this.isUsernameExist(username);
    try {
      return await user.save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(userInfo: User): Promise<User> {
    try {
      return await userInfo.save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async isEmailExist(email: string): Promise<number> {
    const emailExistance = await this.UserModel.countDocuments({
      email: { $regex: new RegExp(email, 'i') },
    });

    if (emailExistance) {
      throw new ConflictException('Email already taken');
    } else {
      return 1;
    }
  }

  async isUsernameExist(username: string): Promise<number> {
    const usernameExistance = await this.UserModel.countDocuments({
      username: { $regex: new RegExp(username, 'i') },
    });

    if (usernameExistance) {
      throw new ConflictException('Username already taken');
    } else {
      return 1;
    }
  }
}

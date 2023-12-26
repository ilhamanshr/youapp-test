import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { User } from './entities/user.entity';
import { promises } from 'fs';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateProfileResponse } from './interface/create-profile-response.interface';
import { getHoroscope } from './enum/horoscope.enum';
import { getZodiac } from './enum/zodiac.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { omit } from 'lodash';
import { RmqContext } from '@nestjs/microservices';
import { RmqService } from '@app/common';
import { UserDetailDto } from './dto/user-detail.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RmqService,
  ) {}

  getHello(): string {
    return 'Welcome to Users API!';
  }

  async getUserById(
    id: string,
    profile: number = 0,
    auth: number = 0,
  ): Promise<User> {
    const userDetail = await this.userRepository.getUserById(id);
    if (!userDetail) {
      if (auth) {
        throw new UnauthorizedException();
      } else {
        throw new NotFoundException(`User with id ${id} is not found`);
      }
    }

    if (profile && userDetail.profilePicture) {
      const imageBuffer = await promises.readFile(
        `./storage/${userDetail.profilePicture}`,
      );
      userDetail.profilePicture = imageBuffer.toString('base64');
    }

    return userDetail;
  }

  async validateUser(userIdentity: string, password: string): Promise<User> {
    return await this.userRepository.validateUser(userIdentity, password);
  }

  async create(payload: CreateUserDto): Promise<User> {
    payload['username'] = payload.username.toLowerCase();
    payload['email'] = payload.email.toLowerCase();
    payload['salt'] = await bcrypt.genSalt();
    payload['password'] = await bcrypt.hash(
      payload['password'],
      payload['salt'],
    );
    const user = await this.userRepository.create(payload);
    return omit(user.toObject(), ['password', 'salt']) as User;
  }

  async createProfile(
    payload: CreateProfileDto,
  ): Promise<CreateProfileResponse> {
    const { date_of_birth } = payload;
    const horoscope = getHoroscope(date_of_birth);
    const zodiac = getZodiac(date_of_birth);
    return { horoscope, zodiac };
  }

  async update(
    id: string,
    payload: UpdateUserDto,
    profilePicture: Express.Multer.File,
    user: User,
  ): Promise<User> {
    const userInfo = await this.getUserById(id);

    if (user._id.toString() != id) {
      throw new UnauthorizedException('thos');
    }

    if (payload.name) userInfo.name = payload.name;
    if (payload.gender) userInfo.gender = payload.gender;
    if (payload.date_of_birth) userInfo.date_of_birth = payload.date_of_birth;
    if (payload.horoscope) userInfo.horoscope = payload.horoscope;
    if (payload.zodiac) userInfo.zodiac = payload.zodiac;
    if (payload.height) userInfo.height = payload.height;
    if (payload.weight) userInfo.weight = payload.weight;
    if (payload.interests) userInfo.interests = payload.interests;
    if (profilePicture) {
      if (!profilePicture.mimetype.startsWith('image')) {
        throw new BadRequestException('Uploaded file must be an image');
      }

      userInfo.profilePicture = profilePicture.filename;
    }

    const result = await this.userRepository.update(userInfo);
    return omit(result, ['password', 'salt']) as User;
  }

  async handleUserLogin(data: any, context: RmqContext): Promise<User> {
    this.logger.log(`Handle incoming ${context.getPattern()} event`);
    const { userIdentity, password } = data;
    try {
      const user = await this.validateUser(userIdentity, password);
      this.logger.log(
        `Send result ${context.getPattern()} event ${JSON.stringify(user)}`,
      );
      return user;
    } catch (error) {
      this.logger.error(`Error ${context.getPattern()} event`, error);
      return error;
    } finally {
      this.rmqService.ack(context);
    }
  }

  async handleUserDetail(
    data: UserDetailDto,
    context: RmqContext,
  ): Promise<User> {
    const { _id, auth } = data;
    this.logger.log(`Handle incoming ${context.getPattern()} event`);
    try {
      const user = await this.getUserById(_id, 0, auth);
      this.logger.log(
        `Send result ${context.getPattern()} event ${JSON.stringify(user)}`,
      );
      return user;
    } catch (error) {
      this.logger.error(`Error ${context.getPattern()} event`, error);
      return error;
    } finally {
      this.rmqService.ack(context);
    }
  }
}

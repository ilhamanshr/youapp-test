import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Param,
  Patch,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  Query,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { JwtGuard } from './guards/jwt.guard';
import { UserIdValidation } from './pipes/user-id-validation.pipe';
import { multerConfig } from './config/multer.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from './decorators/get-user.decorator';
import { megaByteToByte } from './helper/siza-converter';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateProfileResponse } from './interface/create-profile-response.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { UserDetailDto } from './dto/user-detail.dto';

@Controller()
export class UsersController {
  private readonly logger = new Logger(UsersService.name);
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getHello(): string {
    return this.usersService.getHello();
  }

  @Post('register')
  async create(
    @Body() payload: CreateUserDto,
  ): Promise<{ statusCode: number; data: User }> {
    const data = await this.usersService.create(payload);
    return { statusCode: 201, data };
  }

  @UseGuards(JwtGuard)
  @Get('getProfile/:id')
  async findOne(
    @Param('id', UserIdValidation)
    id: string,
  ): Promise<{ statusCode: number; data: User }> {
    const data = await this.usersService.getUserById(id, 1);
    return { statusCode: 200, data };
  }

  @UseGuards(JwtGuard)
  @Get('createProfile')
  async createProfile(
    @Query() payload: CreateProfileDto,
  ): Promise<{ statusCode: number; data: CreateProfileResponse }> {
    const data = await this.usersService.createProfile(payload);
    return { statusCode: 200, data };
  }

  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('profilePicture', multerConfig))
  @Patch('updateProfile/:id')
  async update(
    @Param('id', UserIdValidation) id: string,
    @GetUser() user: User,
    @Body() payload: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: megaByteToByte(5),
          message: 'expected size is less than 5MB',
        })
        .build({ fileIsRequired: false }),
    )
    profilePicture: Express.Multer.File,
  ): Promise<{ statusCode: number; data: User }> {
    const data = await this.usersService.update(
      id,
      payload,
      profilePicture,
      user,
    );
    return { statusCode: 200, data };
  }

  @MessagePattern('user-login')
  async handleUserLogin(@Payload() data: any, @Ctx() context: RmqContext) {
    return await this.usersService.handleUserLogin(data, context);
  }

  @MessagePattern('user-detail')
  async handleUserDetail(
    @Payload() data: UserDetailDto,
    @Ctx() context: RmqContext,
  ) {
    return await this.usersService.handleUserDetail(data, context);
  }
}

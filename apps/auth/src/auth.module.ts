import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule, RmqModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshTokens,
  RefreshTokensSchema,
} from './entity/refresh-token.entity';
import { RefreshTokenRepository } from './repository/refresh-token.repository';
import { JwtModule } from '@nestjs/jwt';
import { USERS_SERVICE } from './constants/services';

@Module({
  imports: [
    RmqModule.register({
      name: USERS_SERVICE,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        APP_PORT: Joi.number().required(),
        MONGODB_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_TTL: Joi.number().required(),
        JWT_REFRESH_TTL: Joi.number().required(),
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_AUTH_QUEUE: Joi.string().required(),
      }),
      envFilePath: './apps/auth/.env',
    }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: RefreshTokens.name, schema: RefreshTokensSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<number>('JWT_TTL'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenRepository],
})
export class AuthModule {}

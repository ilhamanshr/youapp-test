import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RefreshTokens,
  RefreshTokensDocument,
} from '../entity/refresh-token.entity';
import { ConfigService } from '@nestjs/config';
// import { User } from '../../user/entities/user.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectModel(RefreshTokens.name)
    private readonly refreshTokensModel: Model<RefreshTokensDocument>,
    private readonly configService: ConfigService,
  ) {}

  async createRefreshToken(user: any): Promise<RefreshTokens> {
    const refreshToken = new this.refreshTokensModel();
    refreshToken.user = user;
    refreshToken.isRevoke = false;
    const expiredAt = new Date();
    expiredAt.setTime(
      expiredAt.getTime() + this.configService.get<number>('JWT_REFRESH_TTL'),
    );
    refreshToken.expired_at = expiredAt;

    return await refreshToken.save();
  }

  async findByUserId(jwtId: string): Promise<RefreshTokensDocument | null> {
    return this.refreshTokensModel.findOne({ _id: jwtId }).exec();
  }
}

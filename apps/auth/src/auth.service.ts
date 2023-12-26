import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { RefreshTokenRepository } from './repository/refresh-token.repository';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './interface/login-response.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConfigService } from '@nestjs/config';
import { USERS_SERVICE } from './constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(USERS_SERVICE) private usersClient: ClientProxy,
  ) {}

  getHello(): string {
    return 'Welcome to Auth API!';
  }

  async login(payload: LoginDto): Promise<LoginResponse> {
    const user = await lastValueFrom(
      this.usersClient.send('user-login', payload),
    );

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const access_token = await this.createAccessToken(user);
    const refresh_token = await this.createRefreshToken(user);

    return {
      statusCode: 201,
      access_token,
      refresh_token,
    } as unknown as LoginResponse;
  }

  async refreshAccessToken(
    payload: RefreshTokenDto,
  ): Promise<{ statusCode: number; access_token: string }> {
    const { refresh_token } = payload;
    const jwtPayload = await this.decodeToken(refresh_token);
    const refreshTokenInfo = await this.refreshTokenRepository.findByUserId(
      jwtPayload.jwtId,
    );

    if (!refreshTokenInfo) {
      throw new UnauthorizedException('Refresh token is not found');
    }

    if (refreshTokenInfo.isRevoke) {
      throw new UnauthorizedException('Refresh token has been revoke');
    }

    const access_token = await this.createAccessToken(refreshTokenInfo.user);

    return {
      statusCode: 201,
      access_token,
    };
  }

  async createAccessToken(user: any): Promise<string> {
    const payload = {
      sub: user._id,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    return accessToken;
  }

  async decodeToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Refresh token expired');
      } else {
        throw new InternalServerErrorException('Failed to decode token');
      }
    }
  }

  async createRefreshToken(user: any): Promise<string> {
    const storeRefreshToken =
      await this.refreshTokenRepository.createRefreshToken(user);
    const payload = {
      jwtId: storeRefreshToken.id,
    };
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<number>('JWT_REFRESH_TTL'),
    });

    return refreshToken;
  }
}

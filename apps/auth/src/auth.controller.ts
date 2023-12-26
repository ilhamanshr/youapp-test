import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './interface/login-response.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getHello(): string {
    return this.authService.getHello();
  }

  @Post('login')
  async login(@Body() payload: LoginDto): Promise<LoginResponse> {
    return await this.authService.login(payload);
  }

  @Post('refreshToken')
  async refreshToken(
    @Body() payload: RefreshTokenDto,
  ): Promise<{ statusCode: number; access_token: string }> {
    return await this.authService.refreshAccessToken(payload);
  }
}

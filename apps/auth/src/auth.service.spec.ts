import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenRepository } from './repository/refresh-token.repository';
import { USERS_SERVICE } from './constants/services';
import { LoginDto } from './dto/login.dto';
import { Types } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { RefreshTokenDto } from './dto/refresh-token.dto';

jest.mock('rxjs', () => ({
  ...jest.requireActual('rxjs'),
  lastValueFrom: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  const mockToken = 'testing-token-mock';
  const mockJwtService = {
    signAsync: jest.fn().mockImplementation(() => mockToken),
    verifyAsync: jest.fn().mockImplementation(() => mockToken),
  };
  const mockConfigService = {
    get: jest.fn(),
  };
  const mockRefreshTokenRepository = {
    createRefreshToken: jest
      .fn()
      .mockImplementation(() => Promise.resolve({ id: 'refreshTokenId' })),
    findByUserId: jest
      .fn()
      .mockImplementation(() => Promise.resolve({ id: 'refreshTokenId' })),
  };
  const mockClientProxy = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
        {
          provide: RefreshTokenRepository,
          useValue: mockRefreshTokenRepository,
        },
        { provide: USERS_SERVICE, useValue: mockClientProxy },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('getHello', () => {
    it('should return a welcome message', () => {
      const result = authService.getHello();
      const expected = 'Welcome to Auth API!';
      expect(result).toBe(expected);
    });
  });

  describe('login', () => {
    it('should return a LoginResponse on successful login', async () => {
      const body: LoginDto = {
        userIdentity: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      };
      const user = {
        _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
        username: 'sarnackryodan',
        email: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      };

      (lastValueFrom as jest.Mock).mockReturnValue(user);

      const result = await authService.login(body);

      expect(result.statusCode).toBe(201);
      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
    });
  });

  describe('refreshAccessToken', () => {
    it('should be refresh access token', async () => {
      const payload: RefreshTokenDto = {
        refresh_token: mockToken,
      };

      expect(await authService.createAccessToken(payload)).toEqual(mockToken);
    });
  });

  describe('createAccessToken', () => {
    it('should be create access token', async () => {
      const user = {
        _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
        username: 'sarnackryodan',
        email: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      };

      expect(await authService.createAccessToken(user)).toEqual(mockToken);
    });
  });

  describe('decodeToken', () => {
    it('should be decode access token', async () => {
      const token = mockToken;

      expect(await authService.decodeToken(token)).toEqual(mockToken);
    });
  });

  describe('createRefreshToken', () => {
    it('should be create refresh token', async () => {
      const user = {
        _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
        username: 'sarnackryodan',
        email: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      };

      expect(await authService.createRefreshToken(user)).toEqual(mockToken);
    });
  });
});

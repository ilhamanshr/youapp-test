import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { find } from 'lodash';

describe('AuthController', () => {
  let authController: AuthController;
  const mockToken = [
    {
      name: 'testingrefreshtoken1',
      isRevoke: false,
      isExpired: false,
    },
    {
      name: 'testingrefreshtoken2',
      isRevoke: true,
      isExpired: true,
    },
    {
      name: 'testingrefreshtoken3',
      isRevoke: false,
      isExpired: true,
    },
  ];
  const mockUser = {
    _id: '65859f3df59b61ffc58de88c',
    username: 'sarnackryodan',
    email: 'sarnackryodan@gmail.com',
    password: 'Qwerty123!',
    name: 'Sarnack',
    gender: 'Male',
    date_of_birth: '1900-05-30',
    horoscope: 'Aries',
    zodiac: 'Rat',
    height: '72.4 in',
    weight: '90 kg',
    interests: ['Music', 'Basketball'],
    profilePicture: '65859f3df59b61ffc58de88c.jpg',
  };
  const mockAuthService = {
    getHello: jest.fn(() => {
      return 'Welcome to Auth API!';
    }),
    login: jest.fn((body) => {
      if (
        mockUser.email == body.userIdentity ||
        mockUser.username == body.userIdentity
      ) {
        if (body.password == mockUser.password) {
          return { statusCode: 201, access_token: '', refresh_token: '' };
        } else {
          return {
            statusCode: 401,
            message: 'Invalid username or password',
            error: 'Unauthorized',
          };
        }
      } else {
        return {
          statusCode: 401,
          message: 'Invalid username or password',
          error: 'Unauthorized',
        };
      }
    }),
    refreshAccessToken: jest.fn((body) => {
      const tokenInfo = find(mockToken, { name: body.refresh_token });

      if (tokenInfo) {
        if (tokenInfo.isRevoke == true) {
          return {
            message: 'Refresh token has been revoke',
            error: 'Unauthorized',
            statusCode: 401,
          };
        } else {
          if (tokenInfo.isExpired == true) {
            return {
              message: 'Refresh token expired',
              error: 'Unauthorized',
              statusCode: 401,
            };
          } else {
            return {
              statusCode: 201,
              access_token: '',
            };
          }
        }
      } else {
        return {
          message: 'Refresh token is not found',
          error: 'Unauthorized',
          statusCode: 401,
        };
      }
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    authController = app.get<AuthController>(AuthController);
  });

  describe('getHello', () => {
    it('should return "Welcome to Auth API!"', () => {
      const result = 'Welcome to Auth API!';

      expect(authController.getHello()).toBe(result);
    });
  });

  describe('login', () => {
    it('should be success login', async () => {
      const body = {
        userIdentity: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      };
      const expected = {
        statusCode: 201,
        access_token: '',
        refresh_token: '',
      };
      const result = await authController.login(body);

      expect(result).toEqual(expected);

      expect(mockAuthService.login).toHaveBeenCalledWith(body);
    });

    it('should be failed login (invalid user identity)', async () => {
      const body = {
        userIdentity: 'sarnackryodanaaaa@gmail.com',
        password: 'Qwerty123!',
      };
      const expected = {
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid username or password',
      };
      const result = await authController.login(body);

      expect(result).toEqual(expected);

      expect(mockAuthService.login).toHaveBeenCalledWith(body);
    });

    it('should be failed login (invalid password)', async () => {
      const body = {
        userIdentity: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!!!!',
      };
      const expected = {
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid username or password',
      };
      const result = await authController.login(body);

      expect(result).toEqual(expected);

      expect(mockAuthService.login).toHaveBeenCalledWith(body);
    });
  });

  describe('refreshToken', () => {
    it('should be success refresh token', async () => {
      const body = {
        refresh_token: 'testingrefreshtoken1',
      };
      const expected = {
        statusCode: 201,
        access_token: '',
      };
      const result = await authController.refreshToken(body);

      expect(result).toEqual(expected);

      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith(body);
    });

    it('should be failed refresh token (refresh token is revoke)', async () => {
      const body = {
        refresh_token: 'testingrefreshtoken2',
      };
      const expected = {
        message: 'Refresh token has been revoke',
        error: 'Unauthorized',
        statusCode: 401,
      };
      const result = await authController.refreshToken(body);

      expect(result).toEqual(expected);

      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith(body);
    });

    it('should be failed refresh token (refresh token expired)', async () => {
      const body = {
        refresh_token: 'testingrefreshtoken3',
      };
      const expected = {
        message: 'Refresh token expired',
        error: 'Unauthorized',
        statusCode: 401,
      };
      const result = await authController.refreshToken(body);

      expect(result).toEqual(expected);

      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith(body);
    });

    it('should be failed refresh token (refresh token is not found)', async () => {
      const body = {
        refresh_token: 'testingrefreshtoken4',
      };
      const expected = {
        message: 'Refresh token is not found',
        error: 'Unauthorized',
        statusCode: 401,
      };
      const result = await authController.refreshToken(body);

      expect(result).toEqual(expected);

      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith(body);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './repository/user.repository';
import { RmqService } from '@app/common';
import { omit } from 'lodash';
import { RmqContext } from '@nestjs/microservices';

class MockRmqContext extends RmqContext {
  getPattern: jest.Mock;
  getMessage: jest.Mock;
  getChannelRef: jest.Mock;
  args;

  constructor() {
    super(undefined); // Pass `undefined` as the first argument to the super constructor
    this.getPattern = jest.fn();
    this.getMessage = jest.fn();
    this.getChannelRef = jest.fn();
    this.args = [null, null, null];
  }
}

describe('AuthService', () => {
  let usersService: UsersService;
  const mockUser = {
    _id: '65859f3df59b61ffc58de88d',
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
  const mockUserRepository = {
    getUserById: jest.fn().mockImplementation(() => Promise.resolve(mockUser)),
    validateUser: jest.fn().mockImplementation(() => Promise.resolve(mockUser)),
    create: jest.fn().mockImplementation(() => Promise.resolve(mockUser)),
    update: jest.fn().mockImplementation(() => Promise.resolve(mockUser)),
  };
  const mockRmqService = {
    ack: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: RmqService, useValue: mockRmqService },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('getHello', () => {
    it('should return a welcome message', () => {
      const result = usersService.getHello();
      const expected = 'Welcome to Users API!';
      expect(result).toBe(expected);
    });
  });

  describe('getUserById', () => {
    it('should return user detail by id', async () => {
      const id = '65859f3df59b61ffc58de88d';
      const profile = 0;
      const auth = 0;

      const result = await usersService.getUserById(id, profile, auth);
      const expected = mockUser;
      expect(result).toEqual(expected);
    });
  });

  describe('validateUser', () => {
    it('should return result of valdidation user', async () => {
      const result = await usersService.validateUser(
        mockUser.email,
        mockUser.password,
      );
      const expected = mockUser;
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should return result user creation', async () => {
      const result = await usersService.validateUser(
        mockUser.email,
        mockUser.password,
      );
      const expected = mockUser;
      expect(result).toEqual(expected);
    });
  });

  describe('createProfile', () => {
    it('should return result user profile horoscope and zodiac', async () => {
      const payload = {
        date_of_birth: '1995-05-30',
      };
      const result = await usersService.createProfile(payload);
      const expected = { horoscope: 'Gemini', zodiac: 'Pig' };
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should return result of user update', async () => {
      const id = '65859f3df59b61ffc58de88d';
      const payload = {
        name: 'Sarnack',
        gender: 'Male',
        date_of_birth: '1900-05-30',
        horoscope: 'Aries',
        zodiac: 'Rat',
        height: '72.4 in',
        weight: '90 kg',
        interests: ['Music', 'Basketball'],
      };
      const mockMulter = {
        profilePicture: '65859f3df59b61ffc58de88c.jpg',
        mimetype: 'image/jpg',
      } as any;

      const result = await usersService.update(
        id,
        payload,
        mockMulter,
        mockUser as any,
      );

      jest.spyOn(mockUserRepository, 'update').mockResolvedValue(mockUser);

      expect(result).toEqual(omit(mockUser, ['password']));
    });
  });

  describe('handleUserLogin', () => {
    it('should return result of validation user login by rpc call', async () => {
      const data = {
        _id: '65859f3df59b61ffc58de88d',
        auth: 1,
      };

      const mockRmqContext = new MockRmqContext();

      const result = await usersService.handleUserLogin(data, mockRmqContext);
      const expected = mockUser;
      expect(result).toEqual(expected);
    });
  });

  describe('handleUserDetail', () => {
    it('should return result of validation user detail by rpc call', async () => {
      const data = {
        _id: '65859f3df59b61ffc58de88d',
        auth: 0,
      };

      const mockRmqContext = new MockRmqContext();

      const result = await usersService.handleUserDetail(data, mockRmqContext);
      const expected = mockUser;
      expect(result).toEqual(expected);
    });
  });
});

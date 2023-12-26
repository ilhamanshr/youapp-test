import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RmqContext } from '@nestjs/microservices';
import { Types } from 'mongoose';
import { User } from './entities/user.entity';
import { find } from 'lodash';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

describe('UsersController', () => {
  let usersController: UsersController;
  const mockUser = [
    {
      _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
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
    },
    {
      _id: new Types.ObjectId('65859f3df59b61ffc58de88d'),
      username: 'ilhamanshr',
      email: 'ilhamanshr@gmail.com',
      password: 'Qwerty123!',
      name: 'Ilham',
      gender: 'Male',
      date_of_birth: '1900-05-30',
      horoscope: 'Gemini',
      zodiac: 'Pig',
      height: '72.4 in',
      weight: '90 kg',
      interests: ['Music', 'Basketball'],
      profilePicture: '65859f3df59b61ffc58de88d.jpg',
    },
  ];
  const mockUsersService = {
    getHello: jest.fn(() => {
      return 'Welcome to Users API!';
    }),
    create: jest.fn((body) => {
      const isEmailExists = find(mockUser, { email: body.email });
      const isUsernameExists = find(mockUser, { username: body.username });

      if (isEmailExists) {
        throw new ConflictException('Email already taken');
      }
      if (isUsernameExists) {
        throw new ConflictException('Username already taken');
      }
      return {
        _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
        username: 'sarnackryodan',
        email: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      };
    }),
    getUserById: jest.fn((id) => {
      const userInfo = find(mockUser, { _id: new Types.ObjectId(id) });

      if (!userInfo) {
        throw new NotFoundException(`User with id ${id} is not found`);
      } else {
        return {
          _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
          username: 'sarnackryodan',
          email: 'sarnackryodan@gmail.com',
          password: 'Qwerty123!',
        };
      }
    }),
    createProfile: jest.fn(() => {
      return { horoscope: 'Gemini', zodiac: 'Pig' };
    }),
    update: jest.fn((id, query, mockMulter, user) => {
      const userInfo = find(mockUser, { _id: new Types.ObjectId(id) });

      if (!userInfo) {
        throw new NotFoundException(`User to chat with id ${id} is not found`);
      } else {
        if (!mockMulter.profilePicture) {
          throw new BadRequestException('Uploaded file must be an image');
        } else {
          return user;
        }
      }
    }),
    handleUserDetail: jest.fn(() => {
      return {
        _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
        username: 'sarnackryodan',
        email: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      };
    }),
    handleUserLogin: jest.fn(() => {
      return {
        _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
        username: 'sarnackryodan',
        email: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      };
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    usersController = app.get<UsersController>(UsersController);
  });

  describe('getHello', () => {
    it('should return "Welcome to Users API!"', () => {
      const expected = 'Welcome to Users API!';

      expect(usersController.getHello()).toBe(expected);
    });
  });

  describe('create', () => {
    it('should be success create user profile', async () => {
      const body = {
        username: 'sarnack',
        email: 'sarnack@gmail.com',
        password: 'Qwerty123!',
      };
      const expected = {
        statusCode: 201,
        data: {
          _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
          username: 'sarnackryodan',
          email: 'sarnackryodan@gmail.com',
          password: 'Qwerty123!',
        },
      };
      const result = await usersController.create(body);

      expect(result).toEqual(expected);

      expect(mockUsersService.create).toHaveBeenCalledWith(body);
    });

    it('should be failed create user profile (email already exists)', async () => {
      const body = {
        username: 'sarnack',
        email: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      };
      const expected = {
        message: 'Email already taken',
        error: 'Conflict',
        statusCode: 409,
      };

      try {
        await usersController.create(body);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe('Email already taken');
        expect(error.getResponse()).toEqual(expected);
      }

      expect(mockUsersService.create).toHaveBeenCalledWith(body);
    });

    it('should be failed create user profile (username already exists)', async () => {
      const body = {
        username: 'sarnackryodan',
        email: 'sarnack@gmail.com',
        password: 'Qwerty123!',
      };
      const expected = {
        message: 'Username already taken',
        error: 'Conflict',
        statusCode: 409,
      };

      try {
        await usersController.create(body);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe('Username already taken');
        expect(error.getResponse()).toEqual(expected);
      }

      expect(mockUsersService.create).toHaveBeenCalledWith(body);
    });
  });
  describe('findOne', () => {
    it('should be success get user profile', async () => {
      const id = '65859f3df59b61ffc58de88c';
      const expected = {
        statusCode: 200,
        data: {
          _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
          username: 'sarnackryodan',
          email: 'sarnackryodan@gmail.com',
          password: 'Qwerty123!',
        },
      };
      const result = await usersController.findOne(id);

      expect(result).toEqual(expected);

      expect(mockUsersService.getUserById).toHaveBeenCalledWith(id, 1);
    });

    it('should be failed get user profile (user is not found)', async () => {
      const id = '65859f3df59b61ffc58de88f';
      const expected = {
        message: `User with id 65859f3df59b61ffc58de88f is not found`,
        error: 'Not Found',
        statusCode: 404,
      };

      try {
        await usersController.findOne(id);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          `User with id 65859f3df59b61ffc58de88f is not found`,
        );
        expect(error.getResponse()).toEqual(expected);
      }

      expect(mockUsersService.getUserById).toHaveBeenCalledWith(id, 1);
    });
  });
  describe('createProfile', () => {
    it('should be success create user profile', async () => {
      const query = {
        date_of_birth: '1900-05-30',
      };
      const expected = {
        statusCode: 200,
        data: {
          horoscope: 'Gemini',
          zodiac: 'Pig',
        },
      };
      const result = await usersController.createProfile(query);

      expect(result).toEqual(expected);

      expect(mockUsersService.createProfile).toHaveBeenCalledWith(query);
    });
  });
  describe('updateProfile', () => {
    it('should be success update user profile', async () => {
      const id = '65859f3df59b61ffc58de88c';
      const query = {
        name: 'Sarnack',
        gender: 'Male',
        date_of_birth: '1900-05-30',
        horoscope: 'Aries',
        zodiac: 'Rat',
        height: '72.4 in',
        weight: '90 kg',
        interests: ['Music', 'Basketball'],
      };
      const user = {
        _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
        username: 'sarnackryodan',
        email: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      } as User;
      const mockMulter = {
        profilePicture: '65859f3df59b61ffc58de88c.jpg',
      } as any;
      const expected = {
        statusCode: 200,
        data: user,
      };
      const result = await usersController.update(id, user, query, mockMulter);

      expect(result).toEqual(expected);

      expect(mockUsersService.update).toHaveBeenCalledWith(
        id,
        query,
        mockMulter,
        user,
      );
    });

    it('should be failed update user profile (user is not found)', async () => {
      const id = '65859f3df59b61ffc58de88f';
      const query = {
        name: 'Sarnack',
        gender: 'Male',
        date_of_birth: '1900-05-30',
        horoscope: 'Aries',
        zodiac: 'Rat',
        height: '72.4 in',
        weight: '90 kg',
        interests: ['Music', 'Basketball'],
      };
      const user = {
        _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
        username: 'sarnackryodan',
        email: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      } as User;
      const mockMulter = {
        profilePicture: '65859f3df59b61ffc58de88c.jpg',
      } as any;
      const expected = {
        message: `User to chat with id ${id} is not found`,
        error: 'Not Found',
        statusCode: 404,
      };

      try {
        await usersController.update(id, user, query, mockMulter);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`User to chat with id ${id} is not found`);
        expect(error.getResponse()).toEqual(expected);
      }

      expect(mockUsersService.update).toHaveBeenCalledWith(
        id,
        query,
        mockMulter,
        user,
      );
    });

    it('should be failed update user profile (invalid file format)', async () => {
      const id = '65859f3df59b61ffc58de88c';
      const query = {
        name: 'Sarnack',
        gender: 'Male',
        date_of_birth: '1900-05-30',
        horoscope: 'Aries',
        zodiac: 'Rat',
        height: '72.4 in',
        weight: '90 kg',
        interests: ['Music', 'Basketball'],
      };
      const user = {
        _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
        username: 'sarnackryodan',
        email: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      } as User;
      const mockMulter = {
        profilePicture: '',
      } as any;
      const expected = {
        message: `Uploaded file must be an image`,
        error: 'Bad Request',
        statusCode: 400,
      };

      try {
        await usersController.update(id, user, query, mockMulter);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(`Uploaded file must be an image`);
        expect(error.getResponse()).toEqual(expected);
      }

      expect(mockUsersService.update).toHaveBeenCalledWith(
        id,
        query,
        mockMulter,
        user,
      );
    });
  });
  describe('handleUserLogin', () => {
    it('should be success handle rpc call', async () => {
      const body = {
        _id: '65859f3df59b61ffc58de88d',
        auth: 0,
      };
      const rmqContext = {} as RmqContext;
      const expected = {
        _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
        username: 'sarnackryodan',
        email: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      };
      const result = await usersController.handleUserLogin(body, rmqContext);

      expect(result).toEqual(expected);

      expect(mockUsersService.handleUserLogin).toHaveBeenCalledWith(
        body,
        rmqContext,
      );
    });
  });
  describe('handleUserDetail', () => {
    it('should be success handle rpc call', async () => {
      const body = {
        _id: '65859f3df59b61ffc58de88d',
        auth: 0,
      };
      const rmqContext = {} as RmqContext;
      const expected = {
        _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
        username: 'sarnackryodan',
        email: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      };
      const result = await usersController.handleUserDetail(body, rmqContext);

      expect(result).toEqual(expected);

      expect(mockUsersService.handleUserDetail).toHaveBeenCalledWith(
        body,
        rmqContext,
      );
    });
  });
});

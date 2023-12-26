import { Test, TestingModule } from '@nestjs/testing';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { Types } from 'mongoose';
import { find } from 'lodash';
import {
  BadGatewayException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('ChatsController', () => {
  let chatsController: ChatsController;
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
  const mockChatService = {
    getHello: jest.fn(() => {
      return 'Welcome to Chats API!';
    }),
    sendMessage: jest.fn((body, user) => {
      if (!Types.ObjectId.isValid(body.to)) {
        throw new BadGatewayException('request');
      }
      if (body.to.toString() == user._id.toString()) {
        throw new ForbiddenException("You can't chat with yourself");
      } else {
        const userInfo = find(mockUser, { _id: body.to });

        if (!userInfo) {
          throw new NotFoundException(
            `User to chat with id ${body.to} is not found`,
          );
        } else {
          return {
            from: user._id,
            chat_id: '658a524ec39d92f099d7e784',
            to: body.to,
            message: body.message,
          };
        }
      }
    }),
    viewMessages: jest.fn((id, user) => {
      if (id == user._id.toString()) {
        throw new ForbiddenException("You can't chat with yourself");
      } else {
        const userInfo = find(mockUser, { _id: new Types.ObjectId(id) });

        if (!userInfo) {
          throw new NotFoundException(
            `User to chat with id ${id} is not found`,
          );
        } else {
          const chatId = '658a524ec39d92f099d7e784';
          const dataDetails = [
            {
              _id: '658a88c0ef6c7fed48ed01bb',
              created_at: '2023-12-26T08:03:12.845Z',
              from: {
                _id: '65880b3c94e9aed9c72b8129',
                email: 'sarnackryodan@gmail.com',
                name: 'Sarnack',
                username: 'sarnackryodan',
              },
              message: 'Hello ilham',
              to: {
                _id: '65880b5194e9aed9c72b812d',
                email: 'ilhamanshr@gmail.com',
                name: null,
                username: 'ilhamanshr',
              },
            },
          ];
          const total = 51;
          return { chatId, datas: dataDetails, total };
        }
      }
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChatsController],
      providers: [ChatsService],
    })
      .overrideProvider(ChatsService)
      .useValue(mockChatService)
      .compile();

    chatsController = app.get<ChatsController>(ChatsController);
  });

  describe('getHello', () => {
    it('should return "Welcome to Chats API!"', () => {
      const expected = 'Welcome to Chats API!';

      expect(chatsController.getHello()).toBe(expected);
    });
  });

  describe('sendMessage', () => {
    it('should be success send message', async () => {
      const body = {
        to: new Types.ObjectId('65859f3df59b61ffc58de88d'),
        message: 'test message',
      };
      const user = {
        _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
        username: 'sarnackryodan',
        email: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      };
      const expected = {
        statusCode: 201,
        data: {
          from: user._id,
          chat_id: '658a524ec39d92f099d7e784',
          to: body.to,
          message: body.message,
        },
      };
      const result = await chatsController.sendMessage(body, user);

      expect(result).toEqual(expected);

      expect(mockChatService.sendMessage).toHaveBeenCalledWith(body, user);
    });

    it('should be failed send message (cant chat with yourself)', async () => {
      const body = {
        to: new Types.ObjectId('65859f3df59b61ffc58de88c'),
        message: 'test message',
      };
      const user = {
        _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
        username: 'sarnackryodan',
        email: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      };
      const expected = {
        message: "You can't chat with yourself",
        error: 'Forbidden',
        statusCode: 403,
      };

      try {
        await chatsController.sendMessage(body, user);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe("You can't chat with yourself");
        expect(error.getResponse()).toEqual(expected);
      }

      expect(mockChatService.sendMessage).toHaveBeenCalledWith(body, user);
    });

    it('should be failed send message (user to chat not found)', async () => {
      const body = {
        to: new Types.ObjectId('65859f3df59b61ffc58de88f'),
        message: 'test message',
      };
      const user = {
        _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
        username: 'sarnackryodan',
        email: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      };
      const expected = {
        message: `User to chat with id ${body.to} is not found`,
        error: 'Not Found',
        statusCode: 404,
      };

      try {
        await chatsController.sendMessage(body, user);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          `User to chat with id ${body.to} is not found`,
        );
        expect(error.getResponse()).toEqual(expected);
      }

      expect(mockChatService.sendMessage).toHaveBeenCalledWith(body, user);
    });
  });

  describe('viewMessages', () => {
    it('should be success view messages', async () => {
      const id = '65859f3df59b61ffc58de88d';
      const query = {
        page: 1,
        limit: 0,
        clientId: 'testingclientid',
      };
      const user = {
        _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
        username: 'sarnackryodan',
        email: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      };
      const expected = {
        statusCode: 200,
        chatId: '658a524ec39d92f099d7e784',
        datas: [
          {
            _id: '658a88c0ef6c7fed48ed01bb',
            from: {
              _id: '65880b3c94e9aed9c72b8129',
              username: 'sarnackryodan',
              email: 'sarnackryodan@gmail.com',
              name: 'Sarnack',
            },
            to: {
              _id: '65880b5194e9aed9c72b812d',
              username: 'ilhamanshr',
              email: 'ilhamanshr@gmail.com',
              name: null,
            },
            message: 'Hello ilham',
            created_at: '2023-12-26T08:03:12.845Z',
          },
        ],
        total: 51,
      };
      const result = await chatsController.viewMessages(id, query, user);

      expect(result).toEqual(expected);

      expect(mockChatService.viewMessages).toHaveBeenCalledWith(
        id,
        user,
        query,
      );
    });

    it('should be failed view messages (cant chat with yourself)', async () => {
      const id = '65859f3df59b61ffc58de88c';
      const query = {
        page: 1,
        limit: 0,
        clientId: 'testingclientid',
      };
      const user = {
        _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
        username: 'sarnackryodan',
        email: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      };
      const expected = {
        message: "You can't chat with yourself",
        error: 'Forbidden',
        statusCode: 403,
      };

      try {
        await chatsController.viewMessages(id, query, user);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe("You can't chat with yourself");
        expect(error.getResponse()).toEqual(expected);
      }

      expect(mockChatService.viewMessages).toHaveBeenCalledWith(
        id,
        user,
        query,
      );
    });

    it('should be failed view messages (user to chat not found)', async () => {
      const id = '65859f3df59b61ffc58de88f';
      const query = {
        page: 1,
        limit: 0,
        clientId: 'testingclientid',
      };
      const user = {
        _id: new Types.ObjectId('65859f3df59b61ffc58de88c'),
        username: 'sarnackryodan',
        email: 'sarnackryodan@gmail.com',
        password: 'Qwerty123!',
      };
      const expected = {
        message: `User to chat with id ${id} is not found`,
        error: 'Not Found',
        statusCode: 404,
      };

      try {
        await chatsController.viewMessages(id, query, user);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`User to chat with id ${id} is not found`);
        expect(error.getResponse()).toEqual(expected);
      }

      expect(mockChatService.viewMessages).toHaveBeenCalledWith(
        id,
        user,
        query,
      );
    });
  });
});

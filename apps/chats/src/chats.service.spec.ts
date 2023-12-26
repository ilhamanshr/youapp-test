import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from './chats.service';
import { USERS_SERVICE } from './constants/services';
import { ChatRepository } from './repository/chat.repository';
import { NotificationGateway } from './notification.gateway';
import { ConversationRepository } from './repository/conversation.repository';
import { lastValueFrom } from 'rxjs';
import { Types } from 'mongoose';

jest.mock('rxjs', () => ({
  ...jest.requireActual('rxjs'),
  lastValueFrom: jest.fn(),
}));

describe('AuthService', () => {
  let chatsService: ChatsService;
  const mockChat = {
    _id: 'testingchat',
    member: [],
    created_at: '2023-12-26T06:42:24.770Z',
  };
  const mockConversation = {
    from: {
      _id: '65859f3df59b61ffc58de88c',
      username: 'sarnackryodan',
      email: 'sarnackryodan@gmail.com',
      name: 'Sarnack',
    },
    to: {
      _id: '65859f3df59b61ffc58de88d',
      username: 'ilhamanshr',
      email: 'ilhamanshr@gmail.com',
      name: null,
    },
    message: 'Hello ilham',
    _id: '658a75d076c0ac37c114301d',
    created_at: '2023-12-26T06:42:24.770Z',
    __v: 0,
  };
  const mockUser = {
    _id: '65859f3df59b61ffc58de88c',
    username: 'sarnackryodan',
    email: 'sarnackryodan@gmail.com',
    password: 'Qwerty123!',
  };
  const mockChatRepository = {
    findOrCreate: jest.fn().mockImplementation(() => mockChat),
  };
  const mockConversationRepository = {
    getList: jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ datas: [mockConversation], total: 10 }),
      ),
    create: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockConversation)),
  };
  const mockNotificationGateway = {
    server: {
      to: jest.fn(() => ({ emit: jest.fn() })),
    },
  };
  const mockClientProxy = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsService,
        { provide: ChatRepository, useValue: mockChatRepository },
        {
          provide: ConversationRepository,
          useValue: mockConversationRepository,
        },
        { provide: NotificationGateway, useValue: mockNotificationGateway },
        { provide: USERS_SERVICE, useValue: mockClientProxy },
      ],
    }).compile();

    chatsService = module.get<ChatsService>(ChatsService);
  });

  it('should be defined', () => {
    expect(chatsService).toBeDefined();
  });

  describe('getHello', () => {
    it('should return a welcome message', () => {
      const result = chatsService.getHello();
      const expected = 'Welcome to Chats API!';
      expect(result).toBe(expected);
    });
  });

  describe('sendMessage', () => {
    it('should return sent message on success', async () => {
      const payload = {
        to: new Types.ObjectId('65859f3df59b61ffc58de88d'),
        message: 'test message',
      };

      jest
        .spyOn(chatsService, 'checkUserExistance')
        .mockResolvedValue(mockUser);

      const result = await chatsService.sendMessage(payload, mockUser);
      const expected = mockConversation;
      expect(result).toEqual(expected);
    });
  });

  describe('viewMessages', () => {
    it('should return list message on specific chat id to specific client id', async () => {
      const id = '65859f3df59b61ffc58de88d';
      const payload = {
        page: 1,
        limit: 10,
        clientId: 'testing-client-id',
      };

      jest
        .spyOn(chatsService, 'checkUserExistance')
        .mockResolvedValue(mockUser);

      const result = await chatsService.viewMessages(id, mockUser, payload);
      const expected = {
        chatId: mockChat._id,
        datas: [mockConversation],
        total: 10,
      };
      expect(result).toEqual(expected);
    });
  });

  describe('checkUserExistance', () => {
    it('should return is user exists or not', async () => {
      const payload = { _id: mockUser._id, auth: 0 };

      (lastValueFrom as jest.Mock).mockReturnValue(mockUser);

      const result = await chatsService.checkUserExistance(payload);
      const expected = mockUser;
      expect(result).toBe(expected);
    });
  });
});

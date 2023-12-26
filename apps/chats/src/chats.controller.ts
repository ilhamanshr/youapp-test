import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtGuard } from './guards/jwt.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { UserIdValidation } from './pipes/user-id-validation.pipe';
import { GetUser } from './decorators/get-user.decorator';
import { ViewMessagesDto } from './dto/view-messages.dto';
import { Conversation } from './entities/conversation.entity';

@Controller()
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  getHello(): string {
    return this.chatsService.getHello();
  }

  @UseGuards(JwtGuard)
  @Post('sendMessage')
  async sendMessage(
    @Body() payload: SendMessageDto,
    @GetUser() user: any,
  ): Promise<{ statusCode: number; data: Conversation }> {
    const data = await this.chatsService.sendMessage(payload, user);
    return { statusCode: 201, data };
  }

  @UseGuards(JwtGuard)
  @Get('viewMessages/:id')
  async viewMessages(
    @Param('id', UserIdValidation)
    id: string,
    @Query() query: ViewMessagesDto,
    @GetUser() user: any,
  ): Promise<{
    statusCode: number;
    chatId: string;
    datas: Conversation[];
    total: number;
  }> {
    const { chatId, datas, total } = await this.chatsService.viewMessages(
      id,
      user,
      query,
    );
    return { statusCode: 200, chatId, datas, total };
  }
}

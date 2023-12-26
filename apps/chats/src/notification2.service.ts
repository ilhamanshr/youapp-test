import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class NotificationsService {
  constructor(
    private connection: amqp.Connection,
    private channel: amqp.Channel,
    private readonly configService: ConfigService,
  ) {}

  async connect() {
    this.connection = await amqp.connect(
      this.configService.get<string>('RABBIT_MQ_URI'),
    );
    this.channel = await this.connection.createChannel();
  }

  //   async sendMessage(queue: string, message: string) {
  //     this.channel.sendToQueue(queue, Buffer.from(message));
  //   }

  //   async receiveMessage(
  //     queue: string,
  //     callback: (msg: amqp.ConsumeMessage) => void,
  //   ) {
  //     this.channel.assertQueue(queue, { durable: false });
  //     this.channel.consume(queue, callback, { noAck: true });
  //   }
}

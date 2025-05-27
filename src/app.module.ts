import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayController } from './gateway/gateway.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

/**
 * 根模块用于处理其他类的引用与共享。
 */
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MICROSERVICE_CLIENT',
        transport: Transport.TCP,
        options: {
          host: '0.0.0.0',
          port: 3001,
        },
      },
    ]),
  ],
  controllers: [AppController, GatewayController],
  providers: [AppService],
})
export class AppModule {}

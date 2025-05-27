import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayController } from './gateway/gateway.controller';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { getConfig } from './utils';
import { ClientsModule, Transport } from '@nestjs/microservices';

/**
 * 根模块用于处理其他类的引用与共享。
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [getConfig],
    }),
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
    UserModule,
  ],
  controllers: [AppController, GatewayController],
  providers: [AppService],
})
export class AppModule {}

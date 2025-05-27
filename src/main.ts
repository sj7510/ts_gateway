import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import {
  Logger,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const logger = new Logger('Gateway');

  try {
    // Create a hybrid application that can handle both HTTP and microservices
    const app = await NestFactory.create(AppModule);

    // Enable validation pipes with consistent configuration
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        errorHttpStatusCode: 400,
        exceptionFactory: (errors) => {
          const messages = errors
            .map((error) => Object.values(error.constraints || {}))
            .flat();
          logger.debug(`Validation failed: ${messages.join(', ')}`);
          return new HttpException(messages, HttpStatus.BAD_REQUEST);
        },
      }),
    );

    // Enable DI in validators
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    // Configure TCP transport for microservices on port 3001
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 3001,
      },
    });

    // Start microservices
    await app.startAllMicroservices();
    logger.log('Microservice gateway is listening on TCP port 3001');

    // Start HTTP server
    const httpPort = process.env.PORT ?? 3000;
    await app.listen(httpPort);
    logger.log(`HTTP gateway is listening on port ${httpPort}`);
  } catch (error) {
    logger.error(`Failed to start the gateway: ${error.message}`, error.stack);
    process.exit(1);
  }
}

bootstrap().then(() => {});

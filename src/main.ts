import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  VERSION_NEUTRAL,
  VersioningType,
} from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/exception/base.exception.filter';
import { HttpExceptionFilter } from './common/exception/http.exception.filter';
import { FastifyLogger } from './common/logger';
import { generateDocument } from './doc';

declare const module: any;

async function bootstrap() {
  // Create the FastifyAdapter with logger options directly instead of passing a fastify instance
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: FastifyLogger,
    }),
  );

  // 接口版本化管理
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: [VERSION_NEUTRAL, '1', '2'],
  });

  // 启动全局字段校验，保证接口请求字段校验正确
  app.useGlobalPipes(new ValidationPipe());

  // 全局参数返回
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局异常过滤
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // swagger
  generateDocument(app);

  // 添加热部署
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  await app.listen(3000, '0.0.0.0');
}

bootstrap().then(() => {});

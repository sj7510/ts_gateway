import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/exception/base.exception.filter';
import { HttpExceptionFilter } from './common/exception/http.exception.filter';
import { generateDocument } from './doc';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // 接口版本化管理
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: [VERSION_NEUTRAL, '1', '2'],
  });

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

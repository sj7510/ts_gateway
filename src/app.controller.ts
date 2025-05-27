import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * 常见功能是用来处理 http 请求以及调用 service 层的处理方法
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

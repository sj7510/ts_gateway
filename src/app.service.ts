import { Injectable } from '@nestjs/common';

/**
 * 封装通用的业务逻辑、与数据层的交互（例如数据库）、其他额外的一些三方请求。
 */
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

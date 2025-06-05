import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { IS_STREAM_KEY } from '@/common/constants';

/**
 * 定义全局返回参数接口
 */
interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const IS_STREAM = this.reflector.getAllAndOverride<boolean>(IS_STREAM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (IS_STREAM) {
      return next.handle().pipe();
    }
    return next.handle().pipe(
      map((data) => {
        return {
          data,
          status: 0,
          extra: {},
          message: 'success',
          success: true,
        };
      }),
    );
  }
}

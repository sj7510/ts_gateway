import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ClientProxy, ClientsModule } from '@nestjs/microservices';
import { of, throwError, Observable } from 'rxjs';
import { MessageDto } from '../src/gateway/dto/message.dto';

// Mock ClientProxy for testing
class ClientProxyMock extends ClientProxy {
  public isConnected = false;

  // Override connect from ClientProxy
  connect(): Promise<any> {
    this.isConnected = true;
    return Promise.resolve();
  }

  // Override close from ClientProxy
  close(): Promise<any> {
    this.isConnected = false;
    return Promise.resolve();
  }

  // Override send from ClientProxy
  send<TResult = any, TInput = any>(
    pattern: any,
    data: TInput,
  ): Observable<TResult> {
    // Mock successful response for user with ID 1
    if (pattern.cmd === 'get_user_by_id' && data['userId'] === '1') {
      return of({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      } as TResult);
    }

    // Mock successful response for custom pattern
    if (pattern === 'get_data' && data['key'] === 'test') {
      return of({ key: 'test', value: 'test_value' } as TResult);
    }

    // Mock error response for timeout simulation
    if (pattern.cmd === 'get_user_by_id' && data['userId'] === 'timeout') {
      return throwError(() => new Error('Request timed out'));
    }

    // For any other request, return a default mock response
    return of({
      success: true,
      message: 'Mock response',
      pattern,
      data,
    } as TResult);
  }

  // Override emit from ClientProxy
  emit<TResult = any, TInput = any>(
    pattern: string,
    data: TInput,
  ): Observable<TResult> {
    return of(undefined as TResult);
  }

  // Override publish from ClientProxy (required by abstract class)
  protected publish(packet: any, callback: (packet: any) => void): () => void {
    return () => undefined;
  }

  // Override dispatchEvent from ClientProxy (required by abstract class)
  protected dispatchEvent(packet: any): Promise<any> {
    return Promise.resolve();
  }
}

describe('GatewayController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(ClientsModule)
      .useModule({
        module: ClientsModule,
        imports: [],
        providers: [
          {
            provide: 'MICROSERVICE_CLIENT',
            useClass: ClientProxyMock,
          },
        ],
        exports: ['MICROSERVICE_CLIENT'],
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        errorHttpStatusCode: 400,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // Test Pattern 1: Basic request-response
  describe('GET /gateway/users/:id', () => {
    it('should return user data for valid user ID', () => {
      return request(app.getHttpServer())
        .get('/gateway/users/1')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', 1);
          expect(res.body).toHaveProperty('name', 'Test User');
          expect(res.body).toHaveProperty('email', 'test@example.com');
        });
    });

    it('should handle error when microservice times out', () => {
      return request(app.getHttpServer())
        .get('/gateway/users/timeout')
        .expect(HttpStatus.SERVICE_UNAVAILABLE)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            'statusCode',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
          expect(res.body).toHaveProperty('message', 'Service Unavailable');
        });
    });

    it('should handle non-existent user IDs with service unavailable', () => {
      return request(app.getHttpServer())
        .get('/gateway/users/999')
        .expect(HttpStatus.SERVICE_UNAVAILABLE)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Service Unavailable');
        });
    });
  });

  // Test Pattern 2: Event-based communication
  describe('POST /gateway/events', () => {
    it('should emit event and return success response', () => {
      const eventData = {
        type: 'user_created',
        payload: { id: 123, name: 'New User' },
      };

      return request(app.getHttpServer())
        .post('/gateway/events')
        .send(eventData)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('message', 'Event dispatched');
          expect(res.body).toHaveProperty('timestamp');
        });
    });

    it('should accept empty event data and still succeed', () => {
      return request(app.getHttpServer())
        .post('/gateway/events')
        .send({})
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
        });
    });
  });

  // Test Pattern 3: Custom message routing
  describe('POST /gateway/message', () => {
    it('should route custom pattern message and return response', () => {
      const message: MessageDto = {
        pattern: 'get_data',
        data: { key: 'test' },
      };

      return request(app.getHttpServer())
        .post('/gateway/message')
        .send(message)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toHaveProperty('key', 'test');
          expect(res.body).toHaveProperty('value', 'test_value');
        });
    });

    it('should handle missing pattern with validation error', () => {
      const invalidMessage = {
        data: { key: 'test' },
      };

      return request(app.getHttpServer())
        .post('/gateway/message')
        .send(invalidMessage)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(res.body.message.some((msg) => msg.includes('pattern'))).toBe(
            true,
          );
        });
    });

    it('should handle missing data with validation error', () => {
      const invalidMessage = {
        pattern: 'get_data',
      };

      return request(app.getHttpServer())
        .post('/gateway/message')
        .send(invalidMessage)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(res.body.message.some((msg) => msg.includes('data'))).toBe(
            true,
          );
        });
    });

    it('should handle completely empty request', () => {
      return request(app.getHttpServer())
        .post('/gateway/message')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should handle non-object data with validation error', () => {
      const invalidMessage = {
        pattern: 'get_data',
        data: 'not an object',
      };

      return request(app.getHttpServer())
        .post('/gateway/message')
        .send(invalidMessage)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(res.body.message.some((msg) => msg.includes('object'))).toBe(
            true,
          );
        });
    });

    it('should handle unknown pattern with error', () => {
      const message: MessageDto = {
        pattern: 'unknown_pattern',
        data: { test: true },
      };

      return request(app.getHttpServer())
        .post('/gateway/message')
        .send(message)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Processing Error');
        });
    });
  });
});

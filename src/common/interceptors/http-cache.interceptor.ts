import { Injectable, ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Request } from 'express';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest<Request>();

    const httpMethod = request.method;
    if (httpMethod !== 'GET') {
      return undefined;
    }

    return `${httpMethod}-${request.url}-${JSON.stringify(request.query)}`;
  }
}

import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const res = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) => {
        return {
          message: data?.message || 'success',
          statusCode: res.statusCode,
          data: data?.data || null,
          meta: data?.meta || null,
        };
      }),
    );
  }
}

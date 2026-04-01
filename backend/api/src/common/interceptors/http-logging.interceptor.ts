import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { type Request } from 'express';
import { Observable, tap } from 'rxjs';
import { MetricsService } from '../services/metrics.service';

type RequestWithMeta = Request & {
  requestId?: string;
  user?: {
    id?: string;
  };
  method?: string;
  url?: string;
};

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest<RequestWithMeta>();
    const res = context.switchToHttp().getResponse<{ statusCode?: number }>();

    return next.handle().pipe(
      tap({
        next: () => this.record(req, res.statusCode ?? 200, now),
        error: () => this.record(req, res.statusCode ?? 500, now),
      }),
    );
  }

  private record(req: RequestWithMeta, statusCode: number, start: number) {
    const durationMs = Date.now() - start;
    const method = req.method ?? 'UNKNOWN';
    const path = req.url ?? '/';
    const userId = req.user?.id ?? 'anonymous';
    const requestId = req.requestId ?? 'none';

    this.metrics.incrementCounter('http_requests_total', {
      method,
      path,
      status: String(statusCode),
    });
    this.metrics.observeDuration('http_request_duration', durationMs, {
      method,
      path,
    });

    this.logger.log(
      JSON.stringify({
        type: 'http_request',
        requestId,
        method,
        path,
        statusCode,
        durationMs,
        userId,
        timestamp: new Date().toISOString(),
      }),
    );
  }
}

import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';
import { MetricsService } from '../services/metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Public()
  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4')
  getMetrics() {
    return this.metrics.toPrometheusText();
  }
}

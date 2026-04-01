import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private readonly counters = new Map<string, number>();
  private readonly durationSums = new Map<string, number>();
  private readonly durationCounts = new Map<string, number>();

  incrementCounter(name: string, labels?: Record<string, string>) {
    const key = this.buildKey(name, labels);
    this.counters.set(key, (this.counters.get(key) ?? 0) + 1);
  }

  observeDuration(name: string, ms: number, labels?: Record<string, string>) {
    const key = this.buildKey(name, labels);
    this.durationSums.set(key, (this.durationSums.get(key) ?? 0) + ms);
    this.durationCounts.set(key, (this.durationCounts.get(key) ?? 0) + 1);
  }

  toPrometheusText(): string {
    const lines: string[] = [];

    for (const [key, value] of this.counters.entries()) {
      lines.push(`${key} ${value}`);
    }

    for (const [key, sum] of this.durationSums.entries()) {
      const count = this.durationCounts.get(key) ?? 1;
      lines.push(`${key}_sum_ms ${sum}`);
      lines.push(`${key}_count ${count}`);
      lines.push(`${key}_avg_ms ${sum / count}`);
    }

    return `${lines.join('\n')}\n`;
  }

  private buildKey(name: string, labels?: Record<string, string>) {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }

    const serialized = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');

    return `${name}{${serialized}}`;
  }
}

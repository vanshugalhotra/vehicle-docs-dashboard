import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  // Basic check — app is alive (pure static)
  @Get()
  basic() {
    return this.healthService.basic();
  }

  // Liveness probe for Docker/K8s
  @Get('live')
  live() {
    return this.healthService.live();
  }

  // Readiness — ensure DB is reachable
  @Get('ready')
  async readiness(@Res() res: Response) {
    const result = await this.healthService.readiness();

    return res
      .status(
        result.status === 'ready'
          ? HttpStatus.OK
          : HttpStatus.SERVICE_UNAVAILABLE,
      )
      .json(result);
  }

  // System info: version, env, timestamp
  @Get('info')
  info() {
    return this.healthService.info();
  }

  // Full health stats including CPU/memory
  @Get('stats')
  async stats(@Res() res: Response) {
    const result = await this.healthService.stats();
    return res.status(HttpStatus.OK).json(result);
  }
}

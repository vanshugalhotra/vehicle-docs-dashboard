import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as Joi from 'joi';
export interface AppConfig {
  DATABASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  JWT_SECRET: string;
  FRONTEND_URL?: string;

  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;

  TZ: string;
  ALLOWED_ORIGINS: string;

  REMINDER_TIME: string;
  REMINDER_SKIP_EMPTY: boolean;

  LOG_LEVEL: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  LOG_TO_FILE: boolean;
  LOG_DIR: string;
  LOG_RETENTION_DAYS: number;
  LOG_MAX_SIZE: number;
  LOG_DETAIL: boolean;
}

@Injectable()
export class ConfigService {
  private readonly config: AppConfig;

  constructor() {
    let envFile = `.env.${process.env.NODE_ENV || 'development'}`;
    if (!fs.existsSync(envFile)) {
      envFile = '.env';
    }

    dotenv.config({ path: envFile });

    const schema = Joi.object<AppConfig>({
      DATABASE_URL: Joi.string().required(),

      NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),

      PORT: Joi.number().default(3333),

      JWT_SECRET: Joi.string().required(),

      SMTP_HOST: Joi.string().required(),
      SMTP_PORT: Joi.number().required(),
      SMTP_USER: Joi.string().required(),
      SMTP_PASS: Joi.string().required(),

      TZ: Joi.string().default('UTC'),

      ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),
      FRONTEND_URL: Joi.string().optional(),

      REMINDER_TIME: Joi.string().default('08:00'),
      REMINDER_SKIP_EMPTY: Joi.boolean().default(true),

      LOG_LEVEL: Joi.string()
        .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
        .default('info'),

      LOG_TO_FILE: Joi.boolean().default(false),

      LOG_DIR: Joi.string().default('./logs'),

      LOG_RETENTION_DAYS: Joi.number().integer().min(1).default(30),

      LOG_MAX_SIZE: Joi.number().integer().min(1).default(10),
      LOG_DETAIL: Joi.boolean().default(false),
    }).unknown(true);

    const result = schema.validate(process.env, { abortEarly: false });

    if (result.error) {
      throw new Error(`Config validation error: ${result.error.message}`);
    }

    this.config = result.value;
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }
}

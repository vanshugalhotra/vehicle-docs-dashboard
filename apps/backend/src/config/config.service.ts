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

  REMINDER_TIME: string; // e.g., "08:00"
  REMINDER_SKIP_EMPTY: boolean; // true/false
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
      PORT: Joi.number().default(3000),

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

import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';

export interface AppConfig {
  DATABASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  JWT_SECRET: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  TZ: string;
}

@Injectable()
export class ConfigService {
  private readonly config: AppConfig;

  constructor() {
    // Load .env
    dotenv.config({ path: '.env' });

    // Type-safe schema
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

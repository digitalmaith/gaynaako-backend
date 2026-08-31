// src/auth/refresh-token.util.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';

const REFRESH_TOKEN_BYTES = 64;

@Injectable()
export class RefreshTokenGenerator {
  generate(): string {
    return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
  }

  hash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

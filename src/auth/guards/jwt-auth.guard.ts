import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = JwtPayload>(err: unknown, user: JwtPayload | false): TUser {
    if (err || !user) {
      throw err instanceof Error ? err : new UnauthorizedException('Token invalide ou expiré');
    }
    return user as TUser;
  }
}

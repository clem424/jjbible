import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * Garde JWT : remplace l'ancien `authMiddleware` d'Express.
 * Lit le header `Authorization: Bearer <token>`, vérifie le token,
 * puis injecte `request.userId` (utilisé par le décorateur @CurrentUser).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify<{ id: number }>(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
      (request as any).userId = payload.id;
      return true;
    } catch {
      throw new UnauthorizedException('Token invalide');
    }
  }
}

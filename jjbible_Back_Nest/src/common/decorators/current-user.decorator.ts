import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Décorateur personnalisé : récupère l'id de l'utilisateur connecté
 * (injecté par JwtAuthGuard) directement dans la signature du contrôleur.
 *
 *   monEndpoint(@CurrentUser() userId: number) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    return request.userId as number;
  },
);

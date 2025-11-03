import { FastifyRequest, FastifyReply } from 'fastify';
import { RoleType } from '../entities/Role';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    roles: RoleType[];
  };
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
    
    // User data will be attached to request.user by JWT plugin
  } catch (error) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
}

export function requireRole(...allowedRoles: RoleType[]) {
  return async (request: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    try {
      await request.jwtVerify();
      
      const user = request.user as any;
      
      if (!user || !user.roles) {
        return reply.code(403).send({ error: 'Forbidden: No roles assigned' });
      }

      const userRoles = user.roles.map((role: any) => 
        typeof role === 'string' ? role : role.name
      );

      const hasRequiredRole = allowedRoles.some((role) =>
        userRoles.includes(role)
      );

      if (!hasRequiredRole) {
        return reply.code(403).send({
          error: 'Forbidden: Insufficient permissions',
        });
      }
    } catch (error) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  };
}

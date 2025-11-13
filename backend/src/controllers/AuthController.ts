import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/types';
import { IAuthService } from '../interfaces/IAuthService';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.IAuthService) private authService: IAuthService
  ) {}

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = loginSchema.parse(request.body);
      
      const result = await this.authService.login(body);
      
      // Generate JWT token using Fastify JWT plugin
      const token = (request.server as any).jwt.sign({
        id: result.user.id,
        email: result.user.email,
        roles: result.user.roles,
      });

      return reply.code(200).send({
        token,
        user: result.user,
      });
    } catch (error: any) {
      return reply.code(400).send({
        error: error.message || 'Login failed',
      });
    }
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = registerSchema.parse(request.body);
      
      const result = await this.authService.register(body);
      
      // Generate JWT token
      const token = (request.server as any).jwt.sign({
        id: result.user.id,
        email: result.user.email,
        roles: result.user.roles,
      });

      return reply.code(201).send({
        token,
        user: result.user,
      });
    } catch (error: any) {
      return reply.code(400).send({
        error: error.message || 'Registration failed',
      });
    }
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      
      return reply.code(200).send(user);
    } catch (error: any) {
      return reply.code(401).send({
        error: 'Unauthorized',
      });
    }
  }
}

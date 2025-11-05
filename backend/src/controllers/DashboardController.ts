import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/types';
import { DashboardService, IDashboardService } from '../services/DashboardService';

@injectable()
export class DashboardController {
  constructor(
    @inject('IDashboardService') private dashboardService: IDashboardService
  ) {}

  async getDashboard(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const stats = await this.dashboardService.getDashboardStats();
      reply.send(stats);
    } catch (error: any) {
      request.log.error(error);
      reply.status(500).send({
        error: 'Failed to fetch dashboard data',
        message: error.message,
      });
    }
  }
}

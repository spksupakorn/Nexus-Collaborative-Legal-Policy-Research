import 'reflect-metadata';
import { config } from 'dotenv';
import { buildServer } from './server';
import { AppDataSource } from './config/database';

config();

const start = async () => {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('📦 Database connected successfully');

    // Build and start Fastify server
    const server = await buildServer();
    
    const port = parseInt(process.env.API_PORT || '3001', 10);
    const host = '0.0.0.0';

    await server.listen({ port, host });
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

start();

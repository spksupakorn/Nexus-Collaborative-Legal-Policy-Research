import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { Permission } from '../entities/Permission';
import { Document } from '../entities/Document';
import { DocumentLink } from '../entities/DocumentLink';
import { Annotation } from '../entities/Annotation';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'nexus_user',
  password: process.env.DB_PASSWORD || 'nexus_password',
  database: process.env.DB_NAME || 'nexus_db',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Role, Permission, Document, DocumentLink, Annotation],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
});

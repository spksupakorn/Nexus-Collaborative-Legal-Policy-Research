import { User } from '../entities/User';
import { RoleType } from '../entities/Role';

export interface IUserService {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: Partial<User>): Promise<User>;
  update(id: string, userData: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  assignRole(userId: string, roleType: RoleType): Promise<User>;
  hasPermission(userId: string, permission: string): Promise<boolean>;
}

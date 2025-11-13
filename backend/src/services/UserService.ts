import { injectable } from 'inversify';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Role, RoleType } from '../entities/Role';
import { IUserService } from '../interfaces/IUserService';

@injectable()
export class UserService implements IUserService {
  private readonly userRepository = AppDataSource.getRepository(User);
  private readonly roleRepository = AppDataSource.getRepository(Role);

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    const updatedUser = await this.findById(id);
    
    if (!updatedUser) {
      throw new Error('User not found');
    }
    
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async assignRole(userId: string, roleType: RoleType): Promise<User> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const role = await this.roleRepository.findOne({
      where: { name: roleType },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Check if user already has this role
    const hasRole = user.roles.some((r) => r.id === role.id);
    
    if (!hasRole) {
      user.roles.push(role);
      await this.userRepository.save(user);
    }

    return user;
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.findById(userId);
    
    if (!user) {
      return false;
    }

    // Check all roles for the permission
    for (const role of user.roles) {
      const hasPermission = role.permissions?.some((p) => p.name === permission);
      if (hasPermission) {
        return true;
      }
    }

    return false;
  }
}

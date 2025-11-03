import { injectable, inject } from 'inversify';
import { compare, hash } from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Role, RoleType } from '../entities/Role';
import { IAuthService, LoginDTO, RegisterDTO, AuthResponse } from '../interfaces/IAuthService';
import { IUserService } from '../interfaces/IUserService';
import { TYPES } from '../config/types';

@injectable()
export class AuthService implements IAuthService {
  private userRepository = AppDataSource.getRepository(User);
  private roleRepository = AppDataSource.getRepository(Role);

  constructor(
    @inject(TYPES.IUserService) private userService: IUserService
  ) {}

  async login(credentials: LoginDTO): Promise<AuthResponse> {
    const user = await this.userService.findByEmail(credentials.email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await compare(credentials.password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }

  async register(userData: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await this.userService.findByEmail(userData.email);
    
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await hash(userData.password, 10);

    const user = await this.userRepository.save({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isActive: true,
    });

    // Assign default GUEST role
    const guestRole = await this.roleRepository.findOne({
      where: { name: RoleType.GUEST },
    });

    if (guestRole) {
      user.roles = [guestRole];
      await this.userRepository.save(user);
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      // This will be implemented with JWT verification in the middleware
      // For now, return null
      return null;
    } catch (error) {
      return null;
    }
  }

  private generateToken(user: User): string {
    // This is a placeholder - actual JWT generation happens in Fastify JWT plugin
    // The controller will handle token generation using fastify.jwt.sign()
    return '';
  }
}

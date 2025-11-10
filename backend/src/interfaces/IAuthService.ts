import { User } from '../entities/User';
import { RoleType } from '../entities/Role';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RoleResponse {
  id: string;
  name: RoleType;
  description?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: RoleResponse[];
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface IAuthService {
  login(credentials: LoginDTO): Promise<AuthResponse>;
  register(userData: RegisterDTO): Promise<AuthResponse>;
  validateToken(token: string): Promise<User | null>;
}

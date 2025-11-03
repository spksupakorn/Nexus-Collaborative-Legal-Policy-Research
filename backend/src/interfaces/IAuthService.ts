import { User } from '../entities/User';

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

export interface AuthResponse {
  token: string;
  user: Partial<User>;
}

export interface IAuthService {
  login(credentials: LoginDTO): Promise<AuthResponse>;
  register(userData: RegisterDTO): Promise<AuthResponse>;
  validateToken(token: string): Promise<User | null>;
}

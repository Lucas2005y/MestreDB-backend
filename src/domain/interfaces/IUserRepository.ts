import { User } from '../entities/User';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  is_superuser?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
}

export interface IUserRepository {
  create(userData: CreateUserData): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(page?: number, limit?: number): Promise<{ users: User[]; total: number }>;
  update(id: number, userData: UpdateUserData): Promise<User | null>;
  delete(id: number): Promise<boolean>;
  updateLastAccess(id: number): Promise<void>;
  updateLastLogin(id: number): Promise<void>;

  // Soft Delete methods
  findDeleted(page: number, limit: number): Promise<{ users: User[]; total: number }>;
  findOne(options: { where: any; withDeleted?: boolean }): Promise<User | null>;
  restore(id: number): Promise<void>;
  hardDelete(id: number): Promise<void>;
}
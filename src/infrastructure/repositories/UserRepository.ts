import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User as UserEntity } from '../database/entities/User';
import { User } from '../../domain/entities/User';
import { IUserRepository, CreateUserData, UpdateUserData } from '../../domain/interfaces/IUserRepository';

export class UserRepository implements IUserRepository {
  private repository: Repository<UserEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserEntity);
  }

  async create(userData: CreateUserData): Promise<User> {
    const userEntity = this.repository.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      is_superuser: userData.is_superuser || false,
      created_at: new Date(),
      updated_at: new Date()
    });

    const savedUser = await this.repository.save(userEntity);
    return this.mapToDomainEntity(savedUser);
  }

  async findById(id: number): Promise<User | null> {
    const userEntity = await this.repository.findOne({
      where: { id }
    });

    return userEntity ? this.mapToDomainEntity(userEntity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.repository.findOne({
      where: { email }
    });

    return userEntity ? this.mapToDomainEntity(userEntity) : null;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit;

    const [userEntities, total] = await this.repository.findAndCount({
      skip,
      take: limit,
      order: {
        created_at: 'DESC'
      }
    });

    const users = userEntities.map(entity => this.mapToDomainEntity(entity));

    return { users, total };
  }

  async update(id: number, userData: UpdateUserData): Promise<User | null> {
    const existingUser = await this.repository.findOne({
      where: { id }
    });

    if (!existingUser) {
      return null;
    }

    // Atualizar apenas os campos fornecidos
    const updateData: Partial<UserEntity> = {
      updated_at: new Date()
    };

    if (userData.name !== undefined) {
      updateData.name = userData.name;
    }

    if (userData.email !== undefined) {
      updateData.email = userData.email;
    }

    if (userData.password !== undefined) {
      updateData.password = userData.password;
    }

    await this.repository.update(id, updateData);

    const updatedUser = await this.repository.findOne({
      where: { id }
    });

    return updatedUser ? this.mapToDomainEntity(updatedUser) : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  async updateLastAccess(id: number): Promise<void> {
    await this.repository.update(id, {
      last_access: new Date(),
      updated_at: new Date()
    });
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.repository.update(id, {
      last_login: new Date(),
      updated_at: new Date()
    });
  }

  private mapToDomainEntity(userEntity: UserEntity): User {
    return new User(
      userEntity.id,
      userEntity.name,
      userEntity.email,
      userEntity.password,
      userEntity.is_superuser,
      userEntity.last_access,
      userEntity.last_login,
      userEntity.created_at,
      userEntity.updated_at
    );
  }
}
import { DataSource, Repository } from 'typeorm';
import { UserTest } from '../entities/User.test';
import { User } from '../../../domain/entities/User';
import { IUserRepository, CreateUserData, UpdateUserData } from '../../../domain/interfaces/IUserRepository';
import { PasswordService } from '../../../application/services/PasswordService';

export class UserRepositoryTestAdapter implements IUserRepository {
  private repository: Repository<UserTest>;
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
    this.repository = dataSource.getRepository(UserTest);
  }

  async create(userData: CreateUserData): Promise<User> {
    // Usar o PasswordService para hash da senha
    const passwordService = new PasswordService();
    const hashedPassword = await passwordService.hashPassword(userData.password);

    // Criar entidade User
    const user = new UserTest();
    user.name = userData.name;
    user.email = userData.email;
    user.password = hashedPassword;
    user.is_superuser = userData.is_superuser || false;

    const savedUser = await this.repository.save(user);
    return this.mapToDomainEntity(savedUser);
  }

  async findById(id: number): Promise<User | null> {
    const userEntity = await this.repository.findOne({ where: { id } });
    return userEntity ? this.mapToDomainEntity(userEntity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.repository.findOne({ where: { email } });
    return userEntity ? this.mapToDomainEntity(userEntity) : null;
  }

  async findAll(page?: number, limit?: number): Promise<{ users: User[]; total: number }> {
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit;

    const [userEntities, total] = await this.repository.findAndCount({
      skip,
      take,
      order: {
        created_at: 'DESC'
      }
    });

    const users = userEntities.map(entity => this.mapToDomainEntity(entity));
    
    return { users, total };
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    const existingUser = await this.repository.findOne({ where: { id } });
    if (!existingUser) {
      return null;
    }

    await this.repository.update(id, {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      is_superuser: userData.is_superuser,
      last_login: userData.last_login,
      last_access: userData.last_access,
      updated_at: new Date()
    });

    const updatedUser = await this.repository.findOne({ where: { id } });
    return updatedUser ? this.mapToDomainEntity(updatedUser) : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async updateLastAccess(id: number): Promise<void> {
    await this.repository.update(id, {
      last_access: new Date(),
      updated_at: new Date()
    });
  }

  async updateLastLogin(id: number): Promise<void> {
    const now = new Date();
    await this.repository.update(id, {
      last_login: now,
      updated_at: now
    });
  }

  private mapToDomainEntity(userEntity: UserTest): User {
    return User.createUnsafe(
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
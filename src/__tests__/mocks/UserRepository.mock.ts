import { IUserRepository, CreateUserData, UpdateUserData } from '../../domain/interfaces/IUserRepository';
import { User } from '../../domain/entities/User';

export class MockUserRepository implements IUserRepository {
  private users: User[] = [];
  private nextId = 1;

  // Métodos para controlar o mock
  public reset(): void {
    this.users = [];
    this.nextId = 1;
  }

  public addUser(user: User): void {
    this.users.push(user);
    if (user.id >= this.nextId) {
      this.nextId = user.id + 1;
    }
  }

  public setUsers(users: User[]): void {
    this.users = [...users];
    this.nextId = Math.max(...users.map(u => u.id), 0) + 1;
  }

  public getUsers(): User[] {
    return [...this.users];
  }

  // Implementação dos métodos da interface
  async create(userData: CreateUserData): Promise<User> {
    const existingUser = this.users.find(u => u.email === userData.email.toLowerCase());
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    const userResult = User.create(
      this.nextId++,
      userData.name,
      userData.email,
      userData.password,
      userData.is_superuser || false
    );

    if (userResult.isLeft()) {
      throw new Error(userResult.value.message);
    }

    const user = (userResult as any).value;
    this.users.push(user);
    return user;
  }

  async findById(id: number): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email.toLowerCase());
    return user || null;
  }

  async findAll(page?: number, limit?: number): Promise<{ users: User[]; total: number }> {
    const allUsers = [...this.users];
    
    if (page && limit) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = allUsers.slice(startIndex, endIndex);
      return { users: paginatedUsers, total: allUsers.length };
    }
    
    return { users: allUsers, total: allUsers.length };
  }

  async update(id: number, userData: UpdateUserData): Promise<User | null> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return null;
    }

    const currentUser = this.users[userIndex];
    
    // Verificar se o email já está em uso por outro usuário
    if (userData.email && userData.email !== currentUser.email) {
      const existingUser = this.users.find(u => u.email === userData.email && u.id !== id);
      if (existingUser) {
        throw new Error('Email já está em uso');
      }
    }

    const updateResult = currentUser.update(userData);
    if (updateResult.isLeft()) {
      throw new Error(updateResult.value.message);
    }

    const updatedUser = (updateResult as any).value;
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async delete(id: number): Promise<boolean> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return false;
    }

    this.users.splice(userIndex, 1);
    return true;
  }

  async updateLastAccess(id: number): Promise<void> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }

    const updatedUser = this.users[userIndex].updateLastAccess();
    this.users[userIndex] = updatedUser;
  }

  async updateLastLogin(id: number): Promise<void> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }

    const updatedUser = this.users[userIndex].updateLastLogin();
    this.users[userIndex] = updatedUser;
  }
}
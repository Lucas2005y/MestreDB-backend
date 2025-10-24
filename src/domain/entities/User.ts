export class User {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly is_superuser: boolean = false,
    public readonly last_access: Date = new Date(),
    public readonly last_login?: Date,
    public readonly created_at: Date = new Date(),
    public readonly updated_at: Date = new Date()
  ) {}

  // Métodos de negócio
  public isAdmin(): boolean {
    return this.is_superuser;
  }

  public updateLastAccess(): User {
    return new User(
      this.id,
      this.name,
      this.email,
      this.password,
      this.is_superuser,
      new Date(),
      this.last_login,
      this.created_at,
      new Date()
    );
  }

  public updateLastLogin(): User {
    return new User(
      this.id,
      this.name,
      this.email,
      this.password,
      this.is_superuser,
      this.last_access,
      new Date(),
      this.created_at,
      new Date()
    );
  }

  // Método para criar uma nova instância com dados atualizados
  public update(data: Partial<Pick<User, 'name' | 'email' | 'password'>>): User {
    return new User(
      this.id,
      data.name ?? this.name,
      data.email ?? this.email,
      data.password ?? this.password,
      this.is_superuser,
      this.last_access,
      this.last_login,
      this.created_at,
      new Date()
    );
  }

  // Método para serializar sem a senha
  public toJSON(): Omit<User, 'password' | 'toJSON' | 'isAdmin' | 'updateLastAccess' | 'updateLastLogin' | 'update'> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      is_superuser: this.is_superuser,
      last_access: this.last_access,
      last_login: this.last_login,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}
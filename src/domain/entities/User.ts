import { ValidationError, Either, left, right } from '../errors';

export class User {
  private constructor(
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

  /**
   * Factory method para criar um usuário com validações
   */
  public static create(
    id: number,
    name: string,
    email: string,
    password: string,
    is_superuser: boolean = false,
    last_access: Date = new Date(),
    last_login?: Date,
    created_at: Date = new Date(),
    updated_at: Date = new Date()
  ): Either<ValidationError, User> {
    // Validar nome
    const nameValidation = this.validateName(name);
    if (nameValidation.isLeft()) {
      return left(nameValidation.value);
    }

    // Validar email
    const emailValidation = this.validateEmail(email);
    if (emailValidation.isLeft()) {
      return left(emailValidation.value);
    }

    // Validar senha
    const passwordValidation = this.validatePassword(password);
    if (passwordValidation.isLeft()) {
      return left(passwordValidation.value);
    }

    return right(new User(
      id,
      name.trim(),
      email.toLowerCase().trim(),
      password,
      is_superuser,
      last_access,
      last_login,
      created_at,
      updated_at
    ));
  }

  /**
   * Factory method para criar usuário sem validações (para casos internos)
   */
  public static createUnsafe(
    id: number,
    name: string,
    email: string,
    password: string,
    is_superuser: boolean = false,
    last_access: Date = new Date(),
    last_login?: Date,
    created_at: Date = new Date(),
    updated_at: Date = new Date()
  ): User {
    return new User(id, name, email, password, is_superuser, last_access, last_login, created_at, updated_at);
  }

  /**
   * Validação de nome
   */
  public static validateName(name: string): Either<ValidationError, string> {
    if (!name || name.trim().length === 0) {
      return left(ValidationError.fieldRequired('name'));
    }

    if (name.trim().length < 2) {
      return left(ValidationError.fieldTooShort('name', 2));
    }

    if (name.trim().length > 100) {
      return left(ValidationError.fieldTooLong('name', 100));
    }

    // Validar caracteres especiais (apenas letras, espaços e alguns caracteres especiais)
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!nameRegex.test(name.trim())) {
      return left(ValidationError.invalidName(name));
    }

    return right(name.trim());
  }

  /**
   * Validação de email
   */
  public static validateEmail(email: string): Either<ValidationError, string> {
    if (!email || email.trim().length === 0) {
      return left(ValidationError.fieldRequired('email'));
    }

    // Regex mais robusta para validação de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return left(ValidationError.invalidEmail(email));
    }

    if (email.trim().length > 255) {
      return left(ValidationError.fieldTooLong('email', 255));
    }

    return right(email.toLowerCase().trim());
  }

  /**
   * Validação de senha
   */
  public static validatePassword(password: string): Either<ValidationError, string> {
    if (!password || password.length === 0) {
      return left(ValidationError.fieldRequired('password'));
    }

    if (password.length < 6) {
      return left(ValidationError.fieldTooShort('password', 6));
    }

    if (password.length > 255) {
      return left(ValidationError.fieldTooLong('password', 255));
    }

    return right(password);
  }

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
  public update(data: Partial<Pick<User, 'name' | 'email' | 'password'>>): Either<ValidationError, User> {
    const newName = data.name ?? this.name;
    const newEmail = data.email ?? this.email;
    const newPassword = data.password ?? this.password;

    // Validar apenas os campos que foram alterados
    if (data.name !== undefined) {
      const nameValidation = User.validateName(newName);
      if (nameValidation.isLeft()) {
        return left(nameValidation.value);
      }
    }

    if (data.email !== undefined) {
      const emailValidation = User.validateEmail(newEmail);
      if (emailValidation.isLeft()) {
        return left(emailValidation.value);
      }
    }

    if (data.password !== undefined) {
      const passwordValidation = User.validatePassword(newPassword);
      if (passwordValidation.isLeft()) {
        return left(passwordValidation.value);
      }
    }

    return right(new User(
      this.id,
      newName.trim(),
      newEmail.toLowerCase().trim(),
      newPassword,
      this.is_superuser,
      this.last_access,
      this.last_login,
      this.created_at,
      new Date()
    ));
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
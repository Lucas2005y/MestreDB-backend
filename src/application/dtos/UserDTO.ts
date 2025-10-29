import { IsEmail, IsString, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateUserDTO {
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(80, { message: 'Nome deve ter no máximo 80 caracteres' })
  name!: string;

  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @MaxLength(254, { message: 'Email deve ter no máximo 254 caracteres' })
  email!: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @MaxLength(128, { message: 'Senha deve ter no máximo 128 caracteres' })
  password!: string;

  @IsOptional()
  @IsBoolean({ message: 'is_superuser deve ser um boolean' })
  is_superuser?: boolean;
}

export class UpdateUserDTO {
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(80, { message: 'Nome deve ter no máximo 80 caracteres' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @MaxLength(254, { message: 'Email deve ter no máximo 254 caracteres' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @MaxLength(128, { message: 'Senha deve ter no máximo 128 caracteres' })
  password?: string;
}

export class UpdateOwnProfileDTO {
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(80, { message: 'Nome deve ter no máximo 80 caracteres' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @MaxLength(254, { message: 'Email deve ter no máximo 254 caracteres' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @MaxLength(128, { message: 'Senha deve ter no máximo 128 caracteres' })
  password?: string;
}

export class UserResponseDTO {
  id!: number;
  name!: string;
  email!: string;
  is_superuser!: boolean;
  last_access!: Date;
  last_login?: Date;
  created_at!: Date;
  updated_at!: Date;
}

export class PaginatedUsersResponseDTO {
  users!: UserResponseDTO[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
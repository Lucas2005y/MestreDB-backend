import { User } from '../../../../domain/entities/User';
import { ValidationError } from '../../../../domain/errors';

describe('User Entity', () => {
  const validUserData = {
    id: 1,
    name: 'João Silva',
    email: 'joao@example.com',
    password: 'senha123',
    is_superuser: false,
    last_access: new Date('2024-01-01T00:00:00.000Z'),
    last_login: new Date('2024-01-01T00:00:00.000Z'),
    created_at: new Date('2024-01-01T00:00:00.000Z'),
    updated_at: new Date('2024-01-01T00:00:00.000Z')
  };

  describe('create method', () => {
    it('should create a user with valid data', () => {
      const result = User.create(
        validUserData.id,
        validUserData.name,
        validUserData.email,
        validUserData.password,
        validUserData.is_superuser,
        validUserData.last_access,
        validUserData.last_login,
        validUserData.created_at,
        validUserData.updated_at
      );

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        const user = result.value;
        expect(user.id).toBe(validUserData.id);
        expect(user.name).toBe(validUserData.name);
        expect(user.email).toBe(validUserData.email.toLowerCase());
        expect(user.password).toBe(validUserData.password);
        expect(user.is_superuser).toBe(validUserData.is_superuser);
      }
    });

    it('should create a user with default values', () => {
      const result = User.create(1, 'João Silva', 'joao@example.com', 'senha123');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        const user = result.value;
        expect(user.is_superuser).toBe(false);
        expect(user.last_access).toBeInstanceOf(Date);
        expect(user.created_at).toBeInstanceOf(Date);
        expect(user.updated_at).toBeInstanceOf(Date);
      }
    });

    it('should trim name and lowercase email', () => {
      const result = User.create(1, '  João Silva  ', '  JOAO@EXAMPLE.COM  ', 'senha123');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        const user = result.value;
        expect(user.name).toBe('João Silva');
        expect(user.email).toBe('joao@example.com');
      }
    });

    it('should fail with invalid name', () => {
      const result = User.create(1, '', 'joao@example.com', 'senha123');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(ValidationError);
      }
    });

    it('should fail with invalid email', () => {
      const result = User.create(1, 'João Silva', 'invalid-email', 'senha123');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(ValidationError);
      }
    });

    it('should fail with invalid password', () => {
      const result = User.create(1, 'João Silva', 'joao@example.com', '123');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(ValidationError);
      }
    });
  });

  describe('createUnsafe method', () => {
    it('should create a user without validations', () => {
      const user = User.createUnsafe(
        validUserData.id,
        validUserData.name,
        validUserData.email,
        validUserData.password,
        validUserData.is_superuser,
        validUserData.last_access,
        validUserData.last_login,
        validUserData.created_at,
        validUserData.updated_at
      );

      expect(user.id).toBe(validUserData.id);
      expect(user.name).toBe(validUserData.name);
      expect(user.email).toBe(validUserData.email);
      expect(user.password).toBe(validUserData.password);
    });

    it('should create a user with invalid data (no validation)', () => {
      const user = User.createUnsafe(1, '', 'invalid-email', '123');

      expect(user.name).toBe('');
      expect(user.email).toBe('invalid-email');
      expect(user.password).toBe('123');
    });
  });

  describe('validateName method', () => {
    it('should validate correct names', () => {
      const validNames = ['João', 'Maria Silva', 'José da Silva', "O'Connor", 'Ana-Maria'];

      validNames.forEach(name => {
        const result = User.validateName(name);
        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
          expect(result.value).toBe(name.trim());
        }
      });
    });

    it('should fail with empty name', () => {
      const result = User.validateName('');
      expect(result.isLeft()).toBe(true);
    });

    it('should fail with whitespace only name', () => {
      const result = User.validateName('   ');
      expect(result.isLeft()).toBe(true);
    });

    it('should fail with name too short', () => {
      const result = User.validateName('A');
      expect(result.isLeft()).toBe(true);
    });

    it('should fail with name too long', () => {
      const longName = 'A'.repeat(101);
      const result = User.validateName(longName);
      expect(result.isLeft()).toBe(true);
    });

    it('should fail with invalid characters', () => {
      const invalidNames = ['João123', 'Maria@Silva', 'José#Silva', 'Ana$Maria'];

      invalidNames.forEach(name => {
        const result = User.validateName(name);
        expect(result.isLeft()).toBe(true);
      });
    });
  });

  describe('validateEmail method', () => {
    it('should validate correct emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com'
      ];

      validEmails.forEach(email => {
        const result = User.validateEmail(email);
        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
          expect(result.value).toBe(email.toLowerCase().trim());
        }
      });
    });

    it('should fail with empty email', () => {
      const result = User.validateEmail('');
      expect(result.isLeft()).toBe(true);
    });

    it('should fail with invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@domain',
        'user.domain.com',
        'user@domain.',
        'user space@domain.com'
      ];

      invalidEmails.forEach(email => {
        const result = User.validateEmail(email);
        expect(result.isLeft()).toBe(true);
      });
    });

    it('should fail with email too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = User.validateEmail(longEmail);
      expect(result.isLeft()).toBe(true);
    });

    it('should convert email to lowercase', () => {
      const result = User.validateEmail('USER@EXAMPLE.COM');
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toBe('user@example.com');
      }
    });
  });

  describe('validatePassword method', () => {
    it('should validate correct passwords', () => {
      const validPasswords = ['senha123', 'password', 'mySecretPassword123!'];

      validPasswords.forEach(password => {
        const result = User.validatePassword(password);
        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
          expect(result.value).toBe(password);
        }
      });
    });

    it('should fail with empty password', () => {
      const result = User.validatePassword('');
      expect(result.isLeft()).toBe(true);
    });

    it('should fail with password too short', () => {
      const result = User.validatePassword('123');
      expect(result.isLeft()).toBe(true);
    });

    it('should fail with password too long', () => {
      const longPassword = 'a'.repeat(256);
      const result = User.validatePassword(longPassword);
      expect(result.isLeft()).toBe(true);
    });
  });

  describe('business methods', () => {
    let user: User;

    beforeEach(() => {
      const result = User.create(
        validUserData.id,
        validUserData.name,
        validUserData.email,
        validUserData.password,
        false,
        validUserData.last_access,
        validUserData.last_login,
        validUserData.created_at,
        validUserData.updated_at
      );
      if (result.isRight()) {
        user = result.value;
      }
    });

    describe('isAdmin method', () => {
      it('should return false for regular user', () => {
        expect(user.isAdmin()).toBe(false);
      });

      it('should return true for superuser', () => {
        const adminResult = User.create(1, 'Admin', 'admin@example.com', 'senha123', true);
        if (adminResult.isRight()) {
          const admin = adminResult.value;
          expect(admin.isAdmin()).toBe(true);
        }
      });
    });

    describe('updateLastAccess method', () => {
      it('should update last access and updated_at', () => {
        const originalLastAccess = user.last_access;
        const originalUpdatedAt = user.updated_at;

        // Aguardar um pouco para garantir que as datas sejam diferentes
        const updatedUser = user.updateLastAccess();

        expect(updatedUser.last_access.getTime()).toBeGreaterThan(originalLastAccess.getTime());
        expect(updatedUser.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        expect(updatedUser.id).toBe(user.id);
        expect(updatedUser.name).toBe(user.name);
        expect(updatedUser.email).toBe(user.email);
      });
    });

    describe('updateLastLogin method', () => {
      it('should update last login and updated_at', () => {
        const originalUpdatedAt = user.updated_at;

        const updatedUser = user.updateLastLogin();

        expect(updatedUser.last_login).toBeInstanceOf(Date);
        expect(updatedUser.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        expect(updatedUser.id).toBe(user.id);
        expect(updatedUser.name).toBe(user.name);
        expect(updatedUser.email).toBe(user.email);
      });
    });

    describe('update method', () => {
      it('should update name successfully', () => {
        const result = user.update({ name: 'Novo Nome' });

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
          const updatedUser = result.value;
          expect(updatedUser.name).toBe('Novo Nome');
          expect(updatedUser.email).toBe(user.email);
          expect(updatedUser.password).toBe(user.password);
        }
      });

      it('should update email successfully', () => {
        const result = user.update({ email: 'novo@example.com' });

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
          const updatedUser = result.value;
          expect(updatedUser.email).toBe('novo@example.com');
          expect(updatedUser.name).toBe(user.name);
          expect(updatedUser.password).toBe(user.password);
        }
      });

      it('should update password successfully', () => {
        const result = user.update({ password: 'novaSenha123' });

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
          const updatedUser = result.value;
          expect(updatedUser.password).toBe('novaSenha123');
          expect(updatedUser.name).toBe(user.name);
          expect(updatedUser.email).toBe(user.email);
        }
      });

      it('should update multiple fields successfully', () => {
        const result = user.update({
          name: 'Novo Nome',
          email: 'novo@example.com',
          password: 'novaSenha123'
        });

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
          const updatedUser = result.value;
          expect(updatedUser.name).toBe('Novo Nome');
          expect(updatedUser.email).toBe('novo@example.com');
          expect(updatedUser.password).toBe('novaSenha123');
        }
      });

      it('should fail with invalid name', () => {
        const result = user.update({ name: '' });
        expect(result.isLeft()).toBe(true);
      });

      it('should fail with invalid email', () => {
        const result = user.update({ email: 'invalid-email' });
        expect(result.isLeft()).toBe(true);
      });

      it('should fail with invalid password', () => {
        const result = user.update({ password: '123' });
        expect(result.isLeft()).toBe(true);
      });

      it('should update updated_at field', () => {
        const originalUpdatedAt = user.updated_at;
        const result = user.update({ name: 'Novo Nome' });

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
          const updatedUser = result.value;
          expect(updatedUser.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        }
      });
    });

    describe('toJSON method', () => {
      it('should return user data without password and methods', () => {
        const json = user.toJSON();

        expect(json).toEqual({
          id: user.id,
          name: user.name,
          email: user.email,
          is_superuser: user.is_superuser,
          last_access: user.last_access,
          last_login: user.last_login,
          created_at: user.created_at,
          updated_at: user.updated_at
        });

        expect(json).not.toHaveProperty('password');
        expect(json).not.toHaveProperty('toJSON');
        expect(json).not.toHaveProperty('isAdmin');
        expect(json).not.toHaveProperty('updateLastAccess');
        expect(json).not.toHaveProperty('updateLastLogin');
        expect(json).not.toHaveProperty('update');
      });
    });
  });
});
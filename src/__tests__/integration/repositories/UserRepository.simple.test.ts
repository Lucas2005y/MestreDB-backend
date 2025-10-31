import { DataSource } from 'typeorm';
import { UserTest as UserEntity } from '../entities/User.test';

describe('UserRepository Simple Integration Test', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      logging: false,
      entities: [UserEntity],
    });

    await dataSource.initialize();
  });

  afterAll(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Limpar dados antes de cada teste
    const repository = dataSource.getRepository(UserEntity);
    await repository.clear();
  });

  it('should connect to SQLite database', async () => {
    expect(dataSource.isInitialized).toBe(true);
  });

  it('should create a user entity', async () => {
    const repository = dataSource.getRepository(UserEntity);
    
    const userEntity = repository.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      is_superuser: false,
      last_access: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    });

    const savedUser = await repository.save(userEntity);

    expect(savedUser.id).toBeDefined();
    expect(savedUser.name).toBe('Test User');
    expect(savedUser.email).toBe('test@example.com');
  });

  it('should find user by id', async () => {
    const repository = dataSource.getRepository(UserEntity);
    
    const userEntity = repository.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      is_superuser: false,
      last_access: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    });

    const savedUser = await repository.save(userEntity);
    const foundUser = await repository.findOne({ where: { id: savedUser.id } });

    expect(foundUser).toBeDefined();
    expect(foundUser?.name).toBe('Test User');
  });
});
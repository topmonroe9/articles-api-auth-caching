import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcryptjs from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string, defaultValue: any) => {
      if (key === 'JWT_EXPIRATION') {
        return 3600;
      }
      return defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user object when credentials are valid', async () => {
      const user = {
        id: 'test-id',
        email: 'test@example.com',
        username: 'testuser',
        password: await bcryptjs.hash('password', 10),
      };

      mockUsersService.findByEmail.mockResolvedValue(user);
      jest
        .spyOn(bcryptjs, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    });

    it('should return null when user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const user = {
        id: 'test-id',
        email: 'test@example.com',
        username: 'testuser',
        password: await bcryptjs.hash('password', 10),
      };

      mockUsersService.findByEmail.mockResolvedValue(user);
      jest
        .spyOn(bcryptjs, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return JWT token and user info', async () => {
      const user = {
        id: 'test-id',
        email: 'test@example.com',
        username: 'testuser',
      };

      const token = 'jwt-token';
      mockJwtService.sign.mockReturnValue(token);

      // Задаём тестовое значение JWT_EXPIRATION, которое вернёт мок ConfigService
      const jwtExpirationValue = 7200; // Может быть любым
      mockConfigService.get.mockImplementation((key, defaultValue) => {
        if (key === 'JWT_EXPIRATION') {
          return jwtExpirationValue;
        }
        return defaultValue;
      });

      const result = await service.login(user);

      // Проверяем что expiresIn соответствует значению из конфигурации
      expect(result).toEqual({
        access_token: token,
        expiresIn: jwtExpirationValue,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      });

      // Проверяем что JWT был подписан с правильными параметрами
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: user.email, sub: user.id },
        { expiresIn: jwtExpirationValue },
      );

      // Проверяем что ConfigService был вызван с правильными параметрами
      expect(configService.get).toHaveBeenCalledWith(
        'JWT_EXPIRATION',
        expect.any(Number),
      );
    });
  });
});

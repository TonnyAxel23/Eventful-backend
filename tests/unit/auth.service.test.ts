import authService from '../../../src/modules/auth/services/auth.service';
import userRepository from '../../../src/modules/auth/repositories/user.repository';
import { hashPassword, comparePassword } from '../../../src/utils/hashPassword';
import { generateAccessToken, generateRefreshToken } from '../../../src/utils/jwt';

jest.mock('../../../src/modules/auth/repositories/user.repository');
jest.mock('../../../src/utils/hashPassword');
jest.mock('../../../src/utils/jwt');
jest.mock('../../../src/utils/email');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'EVENTEE',
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
      (generateAccessToken as jest.Mock).mockReturnValue('accessToken');
      (generateRefreshToken as jest.Mock).mockReturnValue('refreshToken');

      const result = await authService.register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'EVENTEE',
      });

      expect(result).toHaveProperty('accessToken', 'accessToken');
      expect(result).toHaveProperty('refreshToken', 'refreshToken');
      expect(userRepository.create).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue({ email: 'john@example.com' });

      await expect(authService.register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'EVENTEE',
      })).rejects.toThrow('User already exists with this email');
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const mockUser = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        role: 'EVENTEE',
        isActive: true,
        createdAt: new Date(),
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (generateAccessToken as jest.Mock).mockReturnValue('accessToken');
      (generateRefreshToken as jest.Mock).mockReturnValue('refreshToken');

      const result = await authService.login({
        email: 'john@example.com',
        password: 'Password123',
      });

      expect(result).toHaveProperty('accessToken', 'accessToken');
      expect(result).toHaveProperty('refreshToken', 'refreshToken');
    });

    it('should throw error with invalid credentials', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login({
        email: 'john@example.com',
        password: 'wrong',
      })).rejects.toThrow('Invalid credentials');
    });
  });
});

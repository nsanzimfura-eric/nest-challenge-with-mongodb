import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { CreateUserDto } from './user.dto';

describe('UserService', () => {
  // global user
  const userDto: CreateUserDto = {
    username: 'Eric Test',
    email: 'test@eric.com',
    password: 'password123@',
    location: 'Kigali Rwanda',
  };
  const mockSave = jest.fn();

  let service: UserService;

  // clear mock
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Register user service', () => {
    const mockUserModel = jest.fn().mockImplementation(() => ({
      save: mockSave,
    }));

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UserService,
          {
            provide: getModelToken(User.name),
            useValue: mockUserModel,
          },
        ],
      }).compile();

      service = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should create and return a user', async () => {
      mockSave.mockResolvedValue(userDto);

      const result = await service.createUser(userDto);
      expect(result).toEqual(userDto);
      expect(mockSave).toHaveBeenCalled();
    });
    //  handle errors
    it('should handle errors in createUser', async () => {
      mockSave.mockRejectedValue(new Error('Failed to save'));

      await expect(service.createUser(userDto)).rejects.toThrow(
        'Failed to save',
      );
    });
  });
  //  fetch user
  describe('Get users service', () => {
    const mockUserModel = {
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([userDto]),
      }),
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UserService,
          {
            provide: getModelToken(User.name),
            useValue: mockUserModel,
          },
        ],
      }).compile();

      service = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should return an array of users', async () => {
      const result = await service.getAllUsers();
      expect(result).toEqual([userDto]);
      expect(mockUserModel.find().exec).toHaveBeenCalled();
    });
  });
});

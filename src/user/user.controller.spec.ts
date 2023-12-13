import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    createUser: jest.fn(),
    getAllUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('userController should be defined', () => {
    expect(controller).toBeDefined();
  });
  it(' userService should be defined', () => {
    expect(userService).toBeDefined();
  });

  // global user
  const userDto: CreateUserDto = {
    username: 'Eric Test',
    email: 'test@eric.com',
    password: 'password123@',
    location: 'Kigali Rwanda',
  };

  // create user

  it('should create a user', async () => {
    mockUserService.createUser.mockResolvedValue(userDto);

    expect(await controller.create(userDto)).toEqual(userDto);
    expect(mockUserService.createUser).toHaveBeenCalledWith(userDto);
  });
  // get all users
  it('should get all users', async () => {
    const usersArray = [{ ...userDto }];
    mockUserService.getAllUsers.mockResolvedValue(usersArray);

    expect(await controller.getUsers()).toEqual(usersArray);
    expect(mockUserService.getAllUsers).toHaveBeenCalled();
  });

  //  Testing errors --------

  it('should throw an exception', async () => {
    mockUserService.getAllUsers.mockRejectedValue(new Error());

    await expect(controller.getUsers()).rejects.toThrow(HttpException);
  });

  // error duplicate email:
  it('should throw a conflict exception for duplicate email', async () => {
    const error = new Error() as any;
    error.code = 11000;
    mockUserService.createUser.mockRejectedValue(error);

    await expect(controller.create(userDto)).rejects.toThrow(
      new HttpException('Email already exists', HttpStatus.CONFLICT),
    );
  });
  // handle general errors

  it('should handle general errors', async () => {
    const generalError = new Error('General error');
    mockUserService.createUser.mockRejectedValue(generalError);

    await expect(controller.create(userDto)).rejects.toThrow(
      new HttpException('Failed to create user', HttpStatus.BAD_REQUEST),
    );
  });
});

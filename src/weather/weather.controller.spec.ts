import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

describe('WeatherController', () => {
  let controller: WeatherController;
  let mockWeatherService: Partial<WeatherService>;

  beforeEach(async () => {
    mockWeatherService = {
      getLatestWeatherDataFromDB: jest.fn().mockResolvedValue(['weatherData']),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [{ provide: WeatherService, useValue: mockWeatherService }],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('/weather should return latest weather data', async () => {
    const result = await controller.getLatestWeather();

    expect(result).toEqual(['weatherData']);
    expect(mockWeatherService.getLatestWeatherDataFromDB).toHaveBeenCalled();
  });
});

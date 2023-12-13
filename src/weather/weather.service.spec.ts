import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { Weather } from './schemas/weather.schema';
import { of } from 'rxjs';
import { getModelToken } from '@nestjs/mongoose';

describe('WeatherService', () => {
  let service: WeatherService;
  let weatherModel: Model<Weather>;
  // let httpService: HttpService;

  const mockHttpService = { get: jest.fn() };
  // const mockWeatherModel = {
  //   deleteMany: jest.fn().mockResolvedValue(true),
  //   save: jest.fn().mockImplementation((data) => data),
  // };
  const dummyWeatherData = {
    location: {
      name: 'Westminster',
      region: 'London',
      country: 'UK',
      lat: 51.5,
      lon: -0.14,
      tz_id: 'Europe/London',
      localtime_epoch: 1702487871,
      localtime: '2023-12-13 17:17',
    },
    current: {
      last_updated_epoch: 1702487700,
      last_updated: '2023-12-13 17:15',
      temp_c: 7,
      temp_f: 44.6,
      is_day: 0,
      condition: {
        text: 'Partiellement nuageux',
        icon: '//cdn.weatherapi.com/weather/64x64/night/116.png',
        code: 1003,
      },
      wind_mph: 15,
      wind_kph: 24.1,
      wind_degree: 360,
      wind_dir: 'N',
      pressure_mb: 1007,
      pressure_in: 29.74,
      precip_mm: 0,
      precip_in: 0,
      humidity: 87,
      cloud: 75,
      feelslike_c: 3,
      feelslike_f: 37.3,
      vis_km: 10,
      vis_miles: 6,
      uv: 1,
      gust_mph: 22,
      gust_kph: 35.4,
    },
  };

  // beforeEach(async () => {
  //   // Mock HttpService and WeatherModel
  //   const mockHttpService = {
  //     get: jest.fn(),
  //   };
  //   const mockWeatherModel = {
  //     deleteMany: jest.fn().mockResolvedValue(true),
  //     save: jest.fn().mockImplementation((data) => data),
  //   };

  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [
  //       WeatherService,
  //       { provide: HttpService, useValue: mockHttpService },
  //       { provide: getModelToken(Weather.name), useValue: mockWeatherModel },
  //     ],
  //   }).compile();
  //   service = module.get<WeatherService>(WeatherService);
  //   httpService = module.get<HttpService>(HttpService);
  //   weatherModel = module.get<Model<Weather>>(getModelToken(Weather.name));
  // });

  const mockWeatherModel = jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue(dummyWeatherData),
    deleteMany: jest.fn().mockResolvedValue(true),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: getModelToken(Weather.name), useValue: mockWeatherModel },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    // httpService = module.get<HttpService>(HttpService);
    weatherModel = module.get<Model<Weather>>(getModelToken(Weather.name));
  });

  // expect(httpService).toBeDefined();

  it('should fetch and save weather data successfully', async () => {
    const mockApiResponse = {
      data: {
        ...dummyWeatherData,
      },
    };
    mockHttpService.get.mockReturnValue(of(mockApiResponse));

    const result = await service.fetchWeatherData();

    expect(mockHttpService.get).toHaveBeenCalled();
    expect(weatherModel.deleteMany).toHaveBeenCalled();
    expect(result).toEqual(mockApiResponse.data);
  });

  it('should handle errors in fetchWeatherData', async () => {
    mockHttpService.get.mockImplementation(() => {
      throw new Error('Network error');
    });

    await expect(service.fetchWeatherData()).rejects.toThrow('Network error');
  });
});

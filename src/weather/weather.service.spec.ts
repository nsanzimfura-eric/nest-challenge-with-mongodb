import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { Weather } from './schemas/weather.schema';
import { getModelToken } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('WeatherService', () => {
  let service: WeatherService;

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

  // clear mock
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('WeatherService', () => {
    let weatherService: WeatherService;
    let httpService: HttpService;
    let weatherModel;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WeatherService,
          {
            provide: HttpService,
            useValue: {
              get: jest.fn(() =>
                of({
                  data: {
                    ...dummyWeatherData,
                  },
                }),
              ),
            },
          },
          {
            provide: getModelToken(Weather.name),
            useValue: {
              // new: jest.fn().mockResolvedValue(dummyWeatherData),
              constructor: jest.fn().mockResolvedValue(dummyWeatherData),
              deleteMany: jest.fn(),
              save: jest.fn(),
            },
          },
        ],
      }).compile();

      weatherService = module.get<WeatherService>(WeatherService);
      httpService = module.get<HttpService>(HttpService);
      weatherModel = module.get(getModelToken(Weather.name));
    });

    it('should be defined', () => {
      expect(weatherService).toBeDefined();
    });

    describe('fetchWeatherData', () => {
      it('should fetch and save weather data', async () => {
        await weatherService.fetchWeatherData();
        expect(httpService.get).toHaveBeenCalled();
        expect(weatherModel.deleteMany).toHaveBeenCalled();
      });
    });
  });

  //  fetch WeatherData from the db
  describe('getLatestWeatherDataFromDB', () => {
    const mockWeatherModel = {
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([dummyWeatherData]),
      }),
    };

    beforeEach(async () => {
      const mockHttpService = {
        get: jest.fn().mockReturnValue(dummyWeatherData),
      };
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WeatherService,
          {
            provide: HttpService,
            useValue: mockHttpService,
          },
          {
            provide: getModelToken(Weather.name),
            useValue: mockWeatherModel,
          },
        ],
      }).compile();

      service = module.get<WeatherService>(WeatherService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should return an array weather', async () => {
      const result = await service.getLatestWeatherDataFromDB();
      expect(result).toEqual([dummyWeatherData]);
      expect(mockWeatherModel.find().exec).toHaveBeenCalled();
    });
  });
});

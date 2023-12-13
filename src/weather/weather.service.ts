import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Weather } from './schemas/weather.schema';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WeatherService {
  constructor(
    private httpService: HttpService,
    @InjectModel(Weather.name) private weatherModel: Model<Weather>,
  ) {}

  //get weather data every 1 min, and save them to the db
  // Not here I used very short time interval(1 min), just for testing and we leave console.log there for a proof
  // This means that every 1 sec, we console.log, data from the dab after fetching and save them to the db
  @Cron(CronExpression.EVERY_MINUTE)
  async fetchWeatherData(): Promise<Weather> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.weatherapi.com/v1/current.json?q=SW1&lang=fr&key=${process.env.WEATHER_API_KEY}`,
        ),
      );
      console.log(response.data, 'test--');
      //if we get new data, we Clear previous data
      if (response.data) {
        await this.weatherModel.deleteMany({});
        const newWeather = new this.weatherModel(response.data);
        return await newWeather.save();
      }
    } catch (error) {
      console.log(error);
    }
  }

  //   fetch weather data from DB
  async getLatestWeatherDataFromDB(): Promise<Weather[]> {
    return this.weatherModel.find().exec();
  }
}

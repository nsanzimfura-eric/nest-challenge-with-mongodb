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

  //get weather data every 10 min, and save them to the db
  @Cron(CronExpression.EVERY_10_MINUTES)
  async fetchWeatherData(): Promise<Weather> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.weatherapi.com/v1/current.json?q=SW1&lang=fr&key=${process.env.WEATHER_API_KEY}`,
        ),
      );
      //if we get new data, we Clear previous data
      if (response.data) {
        await this.weatherModel.deleteMany({});
        const newWeather = new this.weatherModel(response.data);
        return await newWeather.save();
      }
    } catch (error) {
      if (error.response) {
        console.error(`API Error: ${error.response.data}`);
      } else if (error.request) {
        console.error(`Network Error: ${error.message}`);
      } else {
        console.error(`An error occurred: ${error.message}`);
      }
      throw error;
    }
  }

  //   fetch weather data from DB
  async getLatestWeatherDataFromDB(): Promise<Weather[]> {
    return this.weatherModel.find().exec();
  }
}

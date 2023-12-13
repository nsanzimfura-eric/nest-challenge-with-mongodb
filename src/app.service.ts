import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  welcomeMessage(): string {
    return 'Welcome to the Weather api, to to "/weather" and get all weather conditions!';
  }
}

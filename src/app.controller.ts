import { Body, Controller, Get, Post } from '@nestjs/common';
import { logger } from 'skyot';
import { AppService } from './app.service';
import { SatService } from './module/SAT/sat.service';

const code = ' 35220356527062010769590009174140104486983850';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  teste(@Body() name: any) {
    logger(JSON.stringify(name));
    return name;
  }

  @Get()
  async getHello() {
    return await new SatService().execute(code);
  }
}

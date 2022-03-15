import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './database/entity/UserEntity';
import { Repository } from './database/repository/Repository';
import { SatService } from './module/SAT/sat.service';

export interface NotesBody {
  code: string;
  email: string;
  date_processed: Date;
  date_created: string;
  status: boolean;
  nota: any;
}

@Controller()
export class AppController {
  repository: Repository;
  constructor(private readonly appService: AppService) {
    this.repository = new Repository(User);
  }

  @Get('history/:email')
  async getNotas(@Param() params: { email: string }) {
    return await this.repository.find({ email: params.email });
  }

  @Get('job')
  async startJob() {
    const data = await this.repository.find<NotesBody>({ status: false });
    // descobrir qual é a nota
    data.forEach((body) => {
      new SatService().execute(body);
    });
    return `Job está processando ${data.length} notas`;
  }

  @Post()
  async getHello(
    @Body()
    body: NotesBody,
  ) {
    this.setInitialBodyValues(body);
    // salvar banco
    try {
      await this.repository.save(body);
      return 'Sua nota está sendo processada, consulte o status dentro de alguns minutos';
    } catch (error) {
      throw new BadRequestException('Essa nota já foi processada');
    }
  }
  // new SatService().execute(' ' + body.code);

  private setInitialBodyValues(body: NotesBody) {
    const [created] = new Date()
      .toLocaleString('en', {
        timeZone: 'America/Sao_Paulo',
      })
      .split(',');
    body.date_created = created;
    body.status = false;
    console.log(body);
  }
}

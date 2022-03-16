import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotAcceptableException,
  Param,
  Post,
} from '@nestjs/common';
import { logger } from 'skyot';
import { AppService } from './app.service';
import { User } from './database/entity/UserEntity';
import { Repository } from './database/repository/Repository';
import { SatService } from './module/SAT/sat.service';

export interface NotesBody {
  _id?: string;
  code: string;
  email: string;
  date_processed?: Date;
  date_created?: string;
  status?: boolean;
  nota?: any;
}

const listaAceitas = ['59'];

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
    const data = await (
      await this.repository.find<NotesBody>({ status: false })
    ).slice(0, 5);
    if (!data.length) return;
    data.forEach((body) => {
      new SatService().execute(body);
    });
    logger(`Job esta processando ${data.length} notas`);
    return `Job está processando ${data.length} notas`;
  }

  @Delete()
  async delete() {
    const data = await this.repository.find<NotesBody>();
    data.forEach(async (body) => {
      await this.repository.delete(body._id);
    });
  }

  @Post()
  async getHello(
    @Body()
    body: NotesBody,
  ) {
    if (!body?.code) throw new BadRequestException('Opa!');

    const codeModel = `${body.code[20]}${body.code[21]}`;
    if (!listaAceitas.includes(codeModel))
      throw new NotAcceptableException('Não temos suporte para essa nota');

    logger(`${body.email} solicitou um processamento da nota ${body.code}`);
    this.setInitialBodyValues(body);
    try {
      logger('salvando...');
      await this.repository.save(body);
      logger('salvo com sucesso.');
      return 'Sua nota está sendo processada, consulte o status dentro de alguns minutos';
    } catch (error) {
      logger('Essa nota ja foi processada');
      throw new BadRequestException('Essa nota já foi processada');
    }
  }

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

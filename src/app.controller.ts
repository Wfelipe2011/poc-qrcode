import { BadRequestException, Controller, Get } from '@nestjs/common';
import { logger, SkyotLogger } from 'skyot';
import { AppService } from './app.service';
import { User } from './database/entity/UserEntity';
import { Repository } from './database/repository/Repository';
import { SatService } from './module/SAT/sat.service';
import { sliceList } from './utils/sliceList';

export interface NotesBody {
  _id?: string;
  code: string;
  email: string;
  date_processed?: Date;
  date_created?: string;
  status?: boolean;
  nota?: any;
}

@Controller()
export class AppController {
  repository: Repository;
  constructor(private readonly appService: AppService) {
    this.repository = new Repository(User);
  }

  @Get('job')
  @SkyotLogger()
  async startJob() {
    let notes = [];
    try {
      notes = await this.repository.find<NotesBody>({ status: false });
    } catch (error) {
      console.log('Acesso banco ', error);
      throw new BadRequestException(error);
    }

    if (!notes.length) return;

    const notesSlice = sliceList(notes, 3);
    let notesPromise = [];
    for (let [index, noteSlice] of notesSlice.entries()) {
      logger(
        `Job esta processando o lote ${index + 1} de ${
          notesSlice.length
        } notas`,
      );
      try {
        noteSlice.forEach((body) =>
          notesPromise.push(SatService.execute(body)),
        );
        await Promise.all(notesPromise);
        notesPromise = [];
      } catch (error) {
        console.log('Execução loop => ', error);
        throw new BadRequestException(error);
      }
    }

    logger(`Total de notas ${notes.length} notas`);
    return `Job está processando ${notes.length} notas`;
  }
}

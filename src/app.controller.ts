import { Controller, Get } from '@nestjs/common';
import { logger } from 'skyot';
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
  async startJob() {
    const notes = await this.repository.find<NotesBody>({ status: false });

    if (!notes.length) return;

    const notesSlice = sliceList(notes, 3);
    let notesPromise = [];
    for (let [index, noteSlice] of notesSlice.entries()) {
      logger(
        `Job esta processando o lote ${index + 1} de ${
          notesSlice.length
        } notas`,
      );
      noteSlice.forEach((body) => notesPromise.push(SatService.execute(body)));
      await Promise.all(notesPromise);
      notesPromise = [];
    }

    logger(`Total de notas ${notes.length} notas`);
    return `Job está processando ${notes.length} notas`;
  }
}

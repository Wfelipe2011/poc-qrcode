import { BadRequestException, Controller, Get } from '@nestjs/common';
import { logger } from 'skyot';
import { AppService } from './app.service';
import { User } from './database/entity/UserEntity';
import { Repository } from './database/repository/Repository';
import { SatService } from './module/SAT/sat.service';
import { diffDays } from './utils/diffTime';
import { sliceList } from './utils/sliceList';

export interface NotesBody {
  _id?: string;
  code?: string;
  email?: string;
  dateProcessed?: Date;
  dateCreated?: string;
  status?: 'success' | 'process' | 'pending' | 'invalid';
  note?: any;
}

@Controller()
export class AppController {
  repository: Repository;
  constructor(private readonly appService: AppService) {
    this.repository = new Repository(User);
  }

  @Get('notes')
  async startNotes() {
    this.executeJob('process');
    return `Job está processando notas`;
  }

  @Get('notes-pending')
  async startNotesPending() {
    this.executeJob('pending');
    return `Job está processando as notas pending`;
  }

  async executeJob(status: string) {
    let notes = [] as NotesBody[];
    try {
      notes = await this.repository.find<NotesBody>({ status });
      notes = this.validPendingNotes(status, notes);
    } catch (error) {
      console.log('Acesso banco ', error);
      throw new BadRequestException(error);
    }

    if (!notes.length) return;

    const notesSlice = sliceList(notes, 5);
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
  }

  private validPendingNotes(status: string, notes: NotesBody[]) {
    if (status === 'pending') {
      const notesFilter = notes.filter((note) =>
        this.spentTwoDays(note.dateProcessed, new Date()),
      );
      return notesFilter;
    }
    return notes;
  }

  private spentTwoDays(dateFrom, dateTo) {
    return Boolean(diffDays(dateFrom, dateTo) >= 2);
  }
}

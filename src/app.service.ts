import { BadRequestException, Injectable } from '@nestjs/common';
import { logger } from 'skyot';
import { NotesBody } from './app.controller';
import { User } from './database/entity/UserEntity';
import { Repository } from './database/repository/Repository';
import { SatService } from './module/SAT/sat.service';
import { diffDays } from './utils/diffTime';
import { sliceList } from './utils/sliceList';

@Injectable()
export class AppService {
  repository: Repository;
  constructor() {
    this.repository = new Repository(User);
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

    if (!notes.length) {
      logger('Nao tem notas para ser processadas');
      return;
    }

    this.notifyExecution(notes);

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
  }

  private notifyExecution(notes: NotesBody[]) {
    notes.forEach(async (note) => {
      const dateProcessed = new Date();
      const entityNotes: NotesBody = {
        dateProcessed,
        status: 'process',
      };
      await this.repository.update({ code: note.code }, entityNotes);
    });
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

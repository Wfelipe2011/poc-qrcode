import { Injectable } from '@nestjs/common';
import { NotesBody } from './app.controller';
import { User } from './database/entity/UserEntity';
import { Repository } from './database/repository/Repository';
import { NFCService } from './module/NFC/nfc.service';
import { diffDays } from './utils/diffTime';

@Injectable()
export class AppService {
  repository: Repository;
  constructor() {
    this.repository = new Repository(User);
  }

  async executeJob(status: string) {
    NFCService.execute({});

    // let notes = [] as NotesBody[];
    // try {
    //   notes = await this.repository.find<NotesBody>({ status });
    //   notes = this.validPendingNotes(status, notes);
    // } catch (error) {
    //   console.log('Acesso banco ', error);
    //   throw new BadRequestException(error);
    // }

    // if (!notes.length) {
    //   logger('Nao tem notas para ser processadas');
    //   return;
    // }

    // this.notifyExecution(notes);

    // const notesSlice = sliceList(notes, 3);
    // let notesPromise = [];
    // for (let [index, noteSlice] of notesSlice.entries()) {
    //   logger(
    //     `Job esta processando o lote ${index + 1} de ${
    //       notesSlice.length
    //     } notas`,
    //   );
    //   try {
    //     for (let body of notes) {
    //       // if (this.isSatNote(body.code)) {
    //       //   notesPromise.push(SatService.execute(body));
    //       // }
    //       if (this.isNFCNote('35220362545579001105650100002830451107855273')) {
    //         notesPromise.push(NFCService.execute(body));
    //       }
    //     }

    //     await Promise.all(notesPromise);
    //     notesPromise = [];
    //   } catch (error) {
    //     console.log('Execução loop => ', error);
    //     throw new BadRequestException(error);
    //   }
    // }

    // logger(`Total de notas ${notes.length} notas`);
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

  isSatNote(code) {
    return Boolean(this.typeNote(code) == '59');
  }

  isNFCNote(code) {
    return Boolean(this.typeNote(code) == '65');
  }

  private typeNote(code: string) {
    return `${code[20]}${code[21]}`;
  }

  private spentTwoDays(dateFrom, dateTo) {
    return Boolean(diffDays(dateFrom, dateTo) >= 2);
  }
}

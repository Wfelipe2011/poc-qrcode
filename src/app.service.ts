import { BadRequestException, Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { logger } from 'skyot';
import { NotesBody } from './app.controller';
import { Notes } from './database/entity/NotesEntity';
import { NotesRepository } from './database/repository/notes.repository';
import { NFCService } from './module/NFC/nfc.service';
import { SatService } from './module/SAT/sat.service';
import { diffDays } from './utils/diffTime';
import { sliceList } from './utils/sliceList';

@Injectable()
export class AppService {
  repository: NotesRepository;
  browser: puppeteer.Browser;
  constructor() {
    this.repository = new NotesRepository(Notes);
    this.factoryBrowserService();
  }

  async executeJobAnalyse() {
    logger('Job Analyse comecou a trabalhar');
    let notes = await this.getNotes('analyse');
    if (!notes.length) {
      logger('Nao tem notas para ser processadas');
      return;
    }
    this.notifyExecution(notes);
    try {
      await this.executeLogicMining(notes, 3);
      logger(`Total de notas ${notes.length} notas`);
    } catch (error) {
      logger(error);
    }
  }

  async executeJobPending() {
    logger('Job Pending comecou a trabalhar');
    let notes = await this.getNotes('pending');
    if (!notes.length) {
      logger('Nao tem notas para ser processadas');
      return;
    }
    try {
      await this.executeLogicMining(notes, 3);
      logger(`Total de notas ${notes.length} notas`);
    } catch (error) {
      logger(error);
    }
    logger(`Total de notas ${notes.length} notas`);
  }

  private async executeLogicMining(notes: NotesBody[], numberSlice: number) {
    const notesSlice = sliceList(notes, numberSlice);
    let notesPromise = [];
    for (let [index, noteSlice] of notesSlice.entries()) {
      logger(`Job esta processando o lote ${index + 1} de ${notesSlice.length} notas`);
      try {
        for (let body of noteSlice) {
          if (this.isSatNote(body.code)) {
            notesPromise.push(SatService.execute(body, this.browser));
          }
          if (this.isNFCNote(body.code)) {
            notesPromise.push(NFCService.execute(body, this.browser));
          }
        }

        await Promise.all(notesPromise);
        notesPromise = [];
      } catch (error) {
        console.log('Execução loop => ', error);
        throw new BadRequestException(error);
      }
    }
  }

  private async getNotes(status: string) {
    try {
      const notesAll = await this.repository.find<NotesBody>({ status });
      const firstSixNotes = notesAll?.splice(0, 6) || [];
      return this.validPendingNotes(status, firstSixNotes);
    } catch (error) {
      console.log('Acesso banco ', error);
      throw new BadRequestException(error);
    }
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
    if (!notes.length) return notes;
    if (status === 'pending') {
      const notesFilter = notes.filter((note) => this.spentTwoDays(note.dateProcessed, new Date()));
      return notesFilter;
    }
    return notes;
  }

  private async factoryBrowserService() {
    this.browser = await puppeteer.launch({
      headless: false,
      ignoreHTTPSErrors: true,
      slowMo: 150,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-features=NetworkService '],
    });
  }

  private isSatNote(code) {
    return Boolean(this.typeNote(code) == '59');
  }

  private isNFCNote(code) {
    return Boolean(this.typeNote(code) == '65');
  }

  private typeNote(code: string) {
    return `${code[20]}${code[21]}`;
  }

  private spentTwoDays(dateFrom, dateTo) {
    return Boolean(diffDays(dateFrom, dateTo) >= 2);
  }
}

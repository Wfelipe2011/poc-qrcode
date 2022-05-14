import * as puppeteer from 'puppeteer';
import { logger } from 'skyot';
import { Notes } from 'src/database/entity/NotesEntity';
import { NotesRepository } from 'src/database/repository/notes.repository';
import { NotesBody } from './../../app.controller';
import { MiningByNotes } from './useCase/MiningByNotes';
import { PassByHome } from './useCase/PassByHome';

export interface ISatService {
  code: string;
  page: puppeteer.Page;
}
export class SatService {
  repository: NotesRepository;

  constructor(readonly code: string, readonly page: puppeteer.Page) {
    this.repository = new NotesRepository(Notes);
  }

  static async execute({ code }: NotesBody, browser: puppeteer.Browser) {
    logger('executando mining Sat');
    const entity = await SatService.factorySatService(code, browser);
    await PassByHome.execute(entity);
    await MiningByNotes.execute(entity);
  }

  private static async factorySatService(code: string, browser: puppeteer.Browser) {
    const page = await browser.newPage();
    return new SatService(code, page);
  }
}

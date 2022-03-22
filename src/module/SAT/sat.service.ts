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
  browser: puppeteer.Browser;
}
export class SatService {
  repository: NotesRepository;

  constructor(
    readonly code: string,
    readonly page: puppeteer.Page,
    readonly browser: puppeteer.Browser,
  ) {
    this.repository = new NotesRepository(Notes);
  }

  static async execute({ code }: NotesBody) {
    logger('executando mining Sat');
    const entity = await SatService.factorySatService(code);
    await PassByHome.execute(entity);
    await MiningByNotes.execute(entity);
  }

  private static async factorySatService(code: string) {
    const browser = await puppeteer.launch({
      headless: true,
      ignoreHTTPSErrors: true,
      slowMo: 50,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--enable-features=NetworkService ',
      ],
    });
    const page = await browser.newPage();
    return new SatService(code, page, browser);
  }
}

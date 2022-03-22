import * as puppeteer from 'puppeteer';
import { logger } from 'skyot';
import { NotesBody } from 'src/app.controller';
import { Notes } from 'src/database/entity/NotesEntity';
import { NotesRepository } from 'src/database/repository/notes.repository';
import { MiningByNotes } from './useCase/MiningByNotes';
import { PassByHome } from './useCase/PassByHome';

export class NFCService {
  repository: NotesRepository;
  constructor(
    readonly code: string,
    readonly page: puppeteer.Page,
    readonly browser: puppeteer.Browser,
  ) {
    this.repository = new NotesRepository(Notes);
  }

  static async execute({ code }: NotesBody) {
    logger('executando mining NFC');
    const entity = await NFCService.factoryNFCService(code);
    await PassByHome.execute(entity);
    await MiningByNotes.execute(entity);
  }

  private static async factoryNFCService(code: string) {
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
    return new NFCService(code, page, browser);
  }
}

import * as puppeteer from 'puppeteer';
import { NotesBody } from 'src/app.controller';
import { User } from 'src/database/entity/UserEntity';
import { Repository } from 'src/database/repository/Repository';
import { MiningByNotes } from './useCase/MiningByNotes';
import { PassByHome } from './useCase/PassByHome';

export class NFCService {
  repository: Repository;
  constructor(
    readonly code: string,
    readonly page: puppeteer.Page,
    readonly browser: puppeteer.Browser,
  ) {
    this.repository = new Repository(User);
  }

  static async execute({ code }: NotesBody) {
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

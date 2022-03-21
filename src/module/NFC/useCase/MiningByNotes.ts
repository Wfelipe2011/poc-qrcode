import { BadRequestException } from '@nestjs/common';
import { logger } from 'skyot';
import { NotesBody } from 'src/app.controller';
import { NFC_SELECTORS_NOTES } from '../entities/Selectors';
import { NFCService } from '../nfc.service';
import {
  miningProduct,
  treatmentsTableEmitent,
  treatmentsTableInfo,
  treatmentsTableProducts,
} from './evaluteFunctions';

export class MiningByNotes {
  static async execute(context: NFCService) {
    try {
      await context.page.waitForSelector(NFC_SELECTORS_NOTES.tableItems);
    } catch (error) {
      await MiningByNotes.verifyNote(context);
      context.browser.close();
    }
    logger('Comecou a minerar html...');
    try {
      let { table: htmlProduct, text } = await context.page.evaluate(
        miningProduct,
        NFC_SELECTORS_NOTES,
      );

      logger('navegou para pagina de abas');
      await context.page.click(NFC_SELECTORS_NOTES.abas);
      logger('esperando carregar html...');
      await context.page.waitForSelector(NFC_SELECTORS_NOTES.tableEmitent);
      logger('Comecou a minerar html...');
      let htmlEmitent = await context.page.evaluate(
        (NFC_SELECTORS_NOTES) =>
          document.querySelector(NFC_SELECTORS_NOTES.tableEmitent).innerHTML,
        NFC_SELECTORS_NOTES,
      );

      const entityNotes = {
        dateProcessed: new Date(),
        status: 'success',
        ...treatmentsTableInfo(text),
        barCode: context.code,
        emitContent: treatmentsTableEmitent(htmlEmitent),
        products: treatmentsTableProducts(htmlProduct),
      };

      console.log(entityNotes);
      logger(
        `Salvando no banco a nota ${context.code} as ${entityNotes.dateProcessed}`,
      );
      await context.repository.update({ code: context.code }, entityNotes);
      logger(`Salvo com sucesso a nota ${context.code}`);
      context.browser.close();
    } catch (error) {
      logger('Erro ao minerar html');
      const note = await context.repository.findOne<NotesBody>({
        code: context.code,
      });
      const dateProcessed = new Date();
      const entityNotes: NotesBody = {
        dateProcessed,
        status: 'analyse',
      };
      await context.repository.update({ code: context.code }, entityNotes);
      logger(
        `Nota: ${context.code} status: ${note.status} date: ${dateProcessed}`,
      );
      context.browser.close();
      throw new BadRequestException(error);
    }
  }

  private static async verifyNote(context: NFCService) {
    logger('nota nao encontrada');
    const note = await context.repository.findOne<NotesBody>({
      code: context.code,
    });
    const dateProcessed = new Date();
    const entityNotes: NotesBody = {
      dateProcessed,
      status: note.status === 'pending' ? 'invalid' : 'pending',
    };
    await context.repository.update({ code: context.code }, entityNotes);
    logger(
      `Nota: ${context.code} status: ${note.status} date: ${dateProcessed}`,
    );
  }
}

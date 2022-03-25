import { BadRequestException } from '@nestjs/common';
import { logger } from 'skyot';
import { NotesBody } from 'src/app.controller';
import {
  SAT_SELECTORS_DETALHE,
  SAT_SELECTORS_NOTES,
} from '../entities/SAT.Selectors';
import { SatService } from '../sat.service';
import {
  dataMining,
  miningGtinCode,
  newNotesEntities,
  setGtinProductsNotes,
} from './evaluteFunctions';

export class MiningByNotes {
  static async execute(context: SatService) {
    try {
      await context.page.waitForSelector(SAT_SELECTORS_NOTES.tableItems);
    } catch (error) {
      await MiningByNotes.verifyNote(context);
      return;
    }
    logger('Comecou a minerar html...');
    try {
      let htmlMining = await context.page.evaluate(
        dataMining,
        SAT_SELECTORS_NOTES,
      );
      const entityNotes = newNotesEntities(htmlMining);

      logger('navegou para pagina de abas');
      await context.page.click(SAT_SELECTORS_DETALHE.inputDetalhe);
      logger('esperando carregar tabela...');
      await context.page.waitForSelector(SAT_SELECTORS_DETALHE.abaProduct);
      await context.page.click(SAT_SELECTORS_DETALHE.abaProduct);
      logger('esperando carregar produtos...');
      await context.page.waitForSelector(SAT_SELECTORS_DETALHE.tableProduct);
      logger('Comecou a minerar html...');

      let listGtin = await context.page.evaluate(
        miningGtinCode,
        SAT_SELECTORS_DETALHE,
      );

      setGtinProductsNotes(entityNotes, listGtin);

      logger(
        `Salvando no banco a nota ${context.code} as ${entityNotes.dateProcessed}`,
      );
      await context.repository.update({ code: context.code }, entityNotes);
      logger(`Salvo com sucesso a nota ${context.code}`);
      context.browser.close();
    } catch (error) {
      logger('Erro ao minerar html');
      const dateProcessed = new Date();
      const entityNotes: NotesBody = {
        dateProcessed,
        status: 'analyse',
      };
      await context.repository.update({ code: context.code }, entityNotes);
      throw new BadRequestException(error);
    }
  }

  private static async verifyNote(context: SatService) {
    logger('nota não encontrada');
    // invalidar nota
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
    context.browser.close();
  }
}

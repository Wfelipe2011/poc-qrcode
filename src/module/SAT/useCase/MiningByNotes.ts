import { BadRequestException } from '@nestjs/common';
import { logger } from 'skyot';
import { NotesBody } from 'src/app.controller';
import { SAT_SELECTORS_NOTES } from '../entities/SAT.Selectors';
import { SatService } from '../sat.service';
import { dataMining, newNotesEntities } from './evaluteFunctions';

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

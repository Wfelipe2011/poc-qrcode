import { BadRequestException, HttpException } from '@nestjs/common';
import { logger } from 'skyot';
import { SELECTORS_NOTES } from '../entities/Selectors';
import { SatService } from '../sat.service';
import { dataMining, newNotesEntities } from './evaluteFunctions';

export class MiningByNotes {
  static async execute(context: SatService) {
    try {
      await context.page.waitForSelector('#tableItens');
    } catch (error) {
      logger('nota não encontrada');
      // invalidar nota
      throw new HttpException('Error timeout', 408);
    }
    logger('Comecou a minerar html...');
    try {
      let htmlMining = await context.page.evaluate(dataMining, SELECTORS_NOTES);
      const entityNotes = newNotesEntities(htmlMining);
      logger(
        `Salvando no banco a nota ${context.code} as ${entityNotes.date_processed}`,
      );
      await context.repository.update({ code: context.code }, entityNotes);
      logger(`Salvo com sucesso a nota ${context.code}`);
      context.browser.close();
    } catch (error) {
      logger('Erro ao minerar html');
      throw new BadRequestException(error);
    }
  }
}

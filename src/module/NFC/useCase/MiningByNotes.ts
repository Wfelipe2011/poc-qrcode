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
      context.page.close();
      return;
    }
    logger('Comecou a minerar html...');
    try {
      let { table: htmlProduct, text } = await context.page.evaluate(miningProduct, NFC_SELECTORS_NOTES);

      logger('navegou para pagina de abas');
      await context.page.click(NFC_SELECTORS_NOTES.abas);
      logger('esperando carregar html...');
      await context.page.waitForSelector(NFC_SELECTORS_NOTES.tableEmitent);
      logger('Comecou a minerar html...');
      let { htmlEmitent, tableProducts } = await context.page.evaluate((NFC_SELECTORS_NOTES) => {
        const htmlEmitent = document.querySelector(NFC_SELECTORS_NOTES.tableEmitent).innerHTML;
        const tableProducts = document.querySelector('#Conteudo_pnlNFe_tabProdServ').innerHTML;

        return { htmlEmitent, tableProducts };
      }, NFC_SELECTORS_NOTES);

      const entityNotes: NotesBody = {
        dateProcessed: new Date(),
        status: 'success',
        note: {
          ...treatmentsTableInfo(text),
          barCode: context.code,
          emitContent: treatmentsTableEmitent(htmlEmitent),
          products: treatmentsTableProducts(htmlProduct),
        },
      };

      for (let product of entityNotes.note.products) {
        product.GTIN = getEANValue(product['DESCRIÇÃO'], tableProducts);
      }

      function getEANValue(value, html) {
        const expresion = `${value}.*?<label>Código EAN Comercial<\/label>.*?<span>(.*?)<\/span>`;
        const regex = new RegExp(expresion, 's');
        console.log(regex);
        console.log(regex.exec(tableProducts)[1]);
        return regex.exec(html)[1];
      }

      logger(`Salvando no banco a nota ${context.code} as ${entityNotes.dateProcessed}`);
      await context.repository.update({ code: context.code }, entityNotes);
      logger(`Salvo com sucesso a nota ${context.code}`);
      context.page.close();
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
      logger(`Nota: ${context.code} status: ${note.status} date: ${dateProcessed}`);
      context.page.close();
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
    logger(`Nota: ${context.code} status: ${note.status} date: ${dateProcessed}`);
  }
}

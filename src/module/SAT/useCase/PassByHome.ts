import { logger } from 'skyot';
import { NotesBody } from 'src/app.controller';
import { resolve_captcha_v2 } from 'src/utils/ResolveCaptcha';
import {
  SAT_SELECTORS_CONFIG,
  SAT_SELECTORS_HOME,
} from '../entities/SAT.Selectors';
import { SatService } from '../sat.service';
import { insertCaptchaCode, submitHome } from './evaluteFunctions';

export class PassByHome {
  static async execute(context: SatService) {
    await context.page.goto(SAT_SELECTORS_CONFIG.site_url, {
      waitUntil: 'domcontentloaded',
    });
    let captcha_token = await resolve_captcha_v2(
      SAT_SELECTORS_CONFIG.site_key,
      SAT_SELECTORS_CONFIG.site_url,
      context.code,
    );
    if (!captcha_token) {
      const dateProcessed = new Date();
      const entityNotes: NotesBody = {
        dateProcessed,
        status: 'analyse',
      };
      await context.repository.update({ code: context.code }, entityNotes);
      logger(
        `Nota: ${context.code} status: ${entityNotes.status} date: ${dateProcessed}`,
      );
      logger('Falha ao obter o TOKEN 😤');
      context.browser.close();
      return;
    }
    logger('Passou do captcha');
    await context.page.type(SAT_SELECTORS_HOME.inputCode, ' ' + context.code);
    logger('Esta digitando...');
    await context.page.evaluate(
      insertCaptchaCode,
      SAT_SELECTORS_HOME,
      captcha_token,
    );
    logger('Fez o submit do formulario');
    await context.page.evaluate(submitHome, SAT_SELECTORS_HOME);
    logger('Esta aguardando o resultado...');
    await context.page.click('[id="my-submit"]');
  }
}

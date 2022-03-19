import { logger } from 'skyot';
import { SatService } from 'src/module/SAT/sat.service';
import {
  insertCaptchaCode,
  submitHome,
} from 'src/module/SAT/useCase/evaluteFunctions';
import { resolve_captcha_v2 } from 'src/utils/ResolveCaptcha';
import {
  NFC_SELECTORS_CONFIG,
  NFC_SELECTORS_HOME,
} from '../entities/Selectors';

export class PassByHome {
  static async execute(context: SatService) {
    await context.page.goto(NFC_SELECTORS_CONFIG.site_url, {
      waitUntil: 'domcontentloaded',
    });
    let captcha_token = await resolve_captcha_v2(
      NFC_SELECTORS_CONFIG.site_key,
      NFC_SELECTORS_CONFIG.site_url,
      context.code,
    );
    if (!captcha_token) return logger('Falha ao obter o TOKEN 😤');
    logger('Passou do captcha');
    await context.page.type(NFC_SELECTORS_HOME.inputCode, ' ' + context.code);
    logger('Esta digitando...');
    await context.page.evaluate(
      insertCaptchaCode,
      NFC_SELECTORS_HOME,
      captcha_token,
    );
    logger('Fez o submit do formulario');
    await context.page.evaluate(submitHome, NFC_SELECTORS_HOME);
    logger('Esta aguardando o resultado...');
    await context.page.click('[id="my-submit"]');
  }
}

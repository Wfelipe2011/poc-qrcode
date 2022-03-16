import { logger } from 'skyot';
import { SELECTORS_CONFIG, SELECTORS_HOME } from '../entities/Selectors';
import { SatService } from '../sat.service';
import { insertCaptchaCode, submitHome } from './evaluteFunctions';
import { resolve_captcha_v2 } from './ResolveCaptcha';

export class PassByHome {
  static async execute(context: SatService) {
    await context.page.goto(SELECTORS_CONFIG.site_url, {
      waitUntil: 'domcontentloaded',
    });
    let captcha_token = await resolve_captcha_v2(
      SELECTORS_CONFIG.site_key,
      SELECTORS_CONFIG.site_url,
      context.code,
    );
    if (!captcha_token) return logger('Falha ao obter o TOKEN 😤');
    logger('Passou do captcha');
    await context.page.type(SELECTORS_HOME.inputCode, ' ' + context.code);
    logger('Esta digitando...');
    await context.page.evaluate(
      insertCaptchaCode,
      SELECTORS_HOME,
      captcha_token,
    );
    logger('Fez o submit do formulario');
    await context.page.evaluate(submitHome, SELECTORS_HOME);
    logger('Esta aguardando o resultado...');
    await context.page.click('[id="my-submit"]');
  }
}

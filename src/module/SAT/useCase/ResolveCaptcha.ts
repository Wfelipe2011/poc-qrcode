import { logger } from 'skyot';

const request = require('request-promise-native');

const API_KEY = process.env.CAPTCHA_API_KEY;

export async function resolve_captcha_v2(google_key: string, site_url: string) {
  let unparsed_captcha_id = await curl({
    method: 'GET',
    url: `https://2captcha.com/in.php?key=${API_KEY}&method=userrecaptcha&googlekey=${google_key}&pageurl=${site_url}&json=true`,
  });

  let parsed_captcha_id = JSON.parse(unparsed_captcha_id as any);
  let captcha_id = parsed_captcha_id.request;

  while (1) {
    await sleep(10);
    logger('verificando se o captcha está pronto...');
    let captcha_ready = await curl({
      method: 'GET',
      url: `https://2captcha.com/res.php?key=${API_KEY}&action=get&id=${captcha_id}&json=true`,
    });

    let parsed_captcha_ready = JSON.parse(captcha_ready as any);

    if (parsed_captcha_ready.status == 1) {
      logger('o seu captcha esta pronto');
    } else {
      logger('ainda resolvendo captcha');
    }

    if (parsed_captcha_ready.status == 1) return parsed_captcha_ready.request;
    else if (parsed_captcha_ready.request != 'CAPCHA_NOT_READY') return false;
  }
}

export async function curl(options) {
  return new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if (err) return reject(err);
      resolve(body);
    });
  });
}

export async function sleep(sec) {
  logger('sleep...');
  return new Promise<void>((resolve, reject) => {
    setTimeout(function () {
      resolve();
    }, sec * 1000);
  });
}

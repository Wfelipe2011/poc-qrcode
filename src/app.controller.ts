import { Body, Controller, Get, Post } from '@nestjs/common';
import { logger } from 'skyot';
import { AppService } from './app.service';
import { SatService } from './module/SAT/sat.service';

const request = require('request-promise-native');
const poll = require('promise-poller').default;

const code = ' 35220356527062010769590009174140104486983850';

const API_KEY = process.env.CAPTCHA_API_KEY;

async function curl(options) {
  return new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if (err) return reject(err);
      resolve(body);
    });
  });
}

async function sleep(sec) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(function () {
      resolve();
    }, sec * 1000);
  });
}

export async function resolve_captcha_v2(google_key, site_url) {
  let unparsed_captcha_id = await curl({
    method: 'GET',
    url: `https://2captcha.com/in.php?key=${API_KEY}&method=userrecaptcha&googlekey=${google_key}&pageurl=${site_url}&json=true`,
  });

  let parsed_captcha_id = JSON.parse(unparsed_captcha_id as any);
  let captcha_id = parsed_captcha_id.request;

  console.log(parsed_captcha_id);

  while (1) {
    await sleep(10);
    console.log('verificando se o captcha está pronto...');
    let captcha_ready = await curl({
      method: 'GET',
      url: `https://2captcha.com/res.php?key=${API_KEY}&action=get&id=${captcha_id}&json=true`,
    });

    let parsed_captcha_ready = JSON.parse(captcha_ready as any);
    console.log(parsed_captcha_ready);
    if (parsed_captcha_ready.status == 1) return parsed_captcha_ready.request;
    else if (parsed_captcha_ready.request != 'CAPCHA_NOT_READY') return false;
  }
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  teste(@Body() name: any) {
    logger(JSON.stringify(name));
    return name;
  }

  @Get()
  async getHello() {
    await new SatService().execute(code);
  }

  async initiateCaptchaRequest() {
    const formData = {
      method: 'userrecaptcha',
      key: 'e565af634c3fc1a1c0647b7659dbf372',
      googlekey: '6LeEy8wUAAAAAHN6Wu2rNdku25fyHUVgovX-rJqM',
      pageurl:
        'https://satsp.fazenda.sp.gov.br/COMSAT/Public/ConsultaPublica/ConsultaPublicaCfe.aspx',
      json: 1,
    };
    const response = await request.post('http://2captcha.com/in.php', {
      form: formData,
    });
    console.log(response);

    return JSON.parse(response).request;
  }

  async pollForRequestResults(
    key,
    id,
    retries = 30,
    interval = 2000,
    delay = 20000,
  ) {
    console.log('1');

    const timeout = (millis) =>
      new Promise((resolve) => setTimeout(resolve, millis));
    await timeout(delay);
    console.log('2');
    return poll({
      taskFn: this.requestCaptchaResults(key, id),
      interval,
      retries,
    });
  }

  requestCaptchaResults(apiKey, requestId) {
    console.log('3');
    const url = `http://2captcha.com/res.php?key=${apiKey}&action=get&id=${requestId}&json=1`;
    return async function () {
      return new Promise(async function (resolve, reject) {
        console.log('4');
        try {
          const rawResponse = await request.get(url);
          console.log(rawResponse);
          const resp = JSON.parse(rawResponse);
          if (resp.status === 0) return reject(resp.request);
          resolve(resp.request);
        } catch (error) {
          console.log(error);
        }
      });
    };
  }
}

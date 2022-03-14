import * as puppeteer from 'puppeteer';
import { resolve_captcha_v2 } from 'src/app.controller';

export class SatService {
  constructor() {}

  async execute(code) {
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
    });
    const page = await browser.newPage();
    let site_key = '6LeEy8wUAAAAAHN6Wu2rNdku25fyHUVgovX-rJqM';
    let site_url =
      'https://satsp.fazenda.sp.gov.br/COMSAT/Public/ConsultaPublica/ConsultaPublicaCfe.aspx';

    await page.goto(site_url);

    let captcha_token = await resolve_captcha_v2(site_key, site_url);
    if (!captcha_token) return console.log('Falha ao obter o TOKEN 😤');

    console.log({ captcha_token });

    console.log('Passou do captcha');
    await page.type('[id="conteudo_txtChaveAcesso"]', code);

    await page.evaluate(
      `document.getElementById("g-recaptcha-response").innerHTML="${captcha_token}";`,
    );

    await page.evaluate(() => {
      console.log('#conteudo_btnConsultar');

      const input = document.querySelector('#conteudo_btnConsultar');
      input.removeAttribute('disabled');
      input.setAttribute('id', 'my-submit');
    });

    await page.click('[id="my-submit"]');
  }
}

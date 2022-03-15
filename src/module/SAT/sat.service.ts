import * as puppeteer from 'puppeteer';
import { logger } from 'skyot';
import { resolve_captcha_v2 } from './useCase/ResolveCaptcha';
import {
  treatmentsEmitContent,
  treatmentsInnerHtml,
  treatmentsTable,
} from './useCase/treatments';
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

    await page.goto(site_url, { waitUntil: 'domcontentloaded' });

    await page.evaluate(() => {
      // pegar site_key dinamicamente
    });
    await this.passarAcess(page, site_key, site_url, code);

    // garimpar os dados

    const dataMining = () => {
      const nodeListTable = document.querySelector('#tableItens')
        .childNodes as any;

      const emitenteContent = document.querySelector('#DadosEmitenteContent')
        .innerHTML as any;

      const satNumber = document.querySelector('#conteudo_lblSatNumeroSerie')
        .innerHTML as any;
      const dateEmit = document.querySelector('#conteudo_lblDataEmissao')
        .innerHTML as any;
      const barCode = document.querySelector('#conteudo_lblIdCfe')
        .innerHTML as any;

      const cnpj = document.querySelector('#conteudo_lblCnpjEmitente')
        .innerHTML as any;

      const ie = document.querySelector('#conteudo_lblIeEmitente')
        .innerHTML as any;

      let table = {};
      for (let node of nodeListTable) {
        table[node.nodeName] = node.innerText;
      }
      return {
        table,
        emitContent: emitenteContent,
        satNumber,
        dateEmit,
        barCode,
        cnpj,
        ie,
      };
    };

    let { table, emitContent, satNumber, dateEmit, barCode, cnpj, ie } =
      await page.evaluate(dataMining);

    const listEmitContent = [
      ...treatmentsInnerHtml(emitContent),
      ...treatmentsInnerHtml(cnpj),
      ...treatmentsInnerHtml(ie),
    ];
    return {
      dateEmit: treatmentsInnerHtml(dateEmit)[0],
      satNumber: treatmentsInnerHtml(satNumber)[0],
      barCode: treatmentsInnerHtml(barCode)[0],
      emitContent: treatmentsEmitContent(listEmitContent),
      products: treatmentsTable(table),
    };
  }

  async passarAcess(page, site_key, site_url, code) {
    let captcha_token = await resolve_captcha_v2(site_key, site_url);
    if (!captcha_token) return logger('Falha ao obter o TOKEN 😤');

    logger('Passou do captcha');
    await page.type('[id="conteudo_txtChaveAcesso"]', code);

    await page.evaluate(
      `document.getElementById("g-recaptcha-response").innerHTML="${captcha_token}";`,
    );

    await page.evaluate(() => {
      const input = document.querySelector('#conteudo_btnConsultar');
      input.removeAttribute('disabled');
      input.setAttribute('id', 'my-submit');
    });

    await page.click('[id="my-submit"]', { waitUntil: 'domcontentloaded' });
  }
}

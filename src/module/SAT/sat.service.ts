import * as puppeteer from 'puppeteer';
import { logger } from 'skyot';
import { User } from 'src/database/entity/UserEntity';
import { Repository } from 'src/database/repository/Repository';
import { NotesBody } from './../../app.controller';
import { resolve_captcha_v2, sleep } from './useCase/ResolveCaptcha';
import {
  treatmentsEmitContent,
  treatmentsInnerHtml,
  treatmentsTable,
} from './useCase/treatments';
export class SatService {
  repository: Repository;
  constructor() {
    this.repository = new Repository(User);
  }

  async execute(body: NotesBody) {
    const { code } = body;
    const browser = await puppeteer.launch({
      headless: true,
      slowMo: 50,
    });
    const page = await browser.newPage();
    let site_key = '6LeEy8wUAAAAAHN6Wu2rNdku25fyHUVgovX-rJqM';
    let site_url =
      'https://satsp.fazenda.sp.gov.br/COMSAT/Public/ConsultaPublica/ConsultaPublicaCfe.aspx';

    await page.goto(site_url, { waitUntil: 'domcontentloaded' });

    await this.passarAcess(page, site_key, site_url, code);

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
    await sleep(10);
    logger('Começou a minerar html...');
    let { table, emitContent, satNumber, dateEmit, barCode, cnpj, ie } =
      await page.evaluate(dataMining);

    const listEmitContent = [
      ...treatmentsInnerHtml(emitContent),
      ...treatmentsInnerHtml(cnpj),
      ...treatmentsInnerHtml(ie),
    ];
    const newLocal = {
      dateEmit: treatmentsInnerHtml(dateEmit)[0],
      satNumber: treatmentsInnerHtml(satNumber)[0],
      barCode: treatmentsInnerHtml(barCode)[0],
      emitContent: treatmentsEmitContent(listEmitContent),
      products: treatmentsTable(table),
    };
    const dateProcess = new Date().toLocaleString('en', {
      timeZone: 'America/Sao_Paulo',
    });
    const newObject = {
      date_processed: dateProcess,
      nota: newLocal,
    };

    logger(`Salvando no banco a nota ${code} as ${dateProcess}`);
    await this.repository.update({ code }, newObject);
    logger(`Salvo com sucesso a nota ${code}`);
  }

  async passarAcess(page, site_key, site_url, code) {
    let captcha_token = await resolve_captcha_v2(site_key, site_url);
    if (!captcha_token) return logger('Falha ao obter o TOKEN 😤');
    logger('Passou do captcha');
    await page.type('[id="conteudo_txtChaveAcesso"]', ' ' + code);
    logger('Está digitando...');
    await page.evaluate(
      `document.getElementById("g-recaptcha-response").innerHTML="${captcha_token}";`,
    );
    logger('Fez o submit do formulario');
    await page.evaluate(() => {
      const input = document.querySelector('#conteudo_btnConsultar');
      input.removeAttribute('disabled');
      input.setAttribute('id', 'my-submit');
    });
    logger('Esta aguardando o resultado...');
    await page.click('[id="my-submit"]');
  }
}

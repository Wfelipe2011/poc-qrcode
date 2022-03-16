import { BadRequestException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { logger } from 'skyot';
import { User } from 'src/database/entity/UserEntity';
import { Repository } from 'src/database/repository/Repository';
import { NotesBody } from './../../app.controller';
import { SELECTORS_HOME } from './entities/Selectors';
import { resolve_captcha_v2 } from './useCase/ResolveCaptcha';
import { treatmentsInnerHtml, treatmentsTable } from './useCase/treatments';
export class SatService {
  repository: Repository;
  constructor() {
    this.repository = new Repository(User);
  }

  async execute(body: NotesBody) {
    const { code } = body;
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
    });
    const page = await browser.newPage();
    let site_key = '6LeEy8wUAAAAAHN6Wu2rNdku25fyHUVgovX-rJqM';
    let site_url =
      'https://satsp.fazenda.sp.gov.br/COMSAT/Public/ConsultaPublica/ConsultaPublicaCfe.aspx';

    await page.goto(site_url, { waitUntil: 'domcontentloaded' });

    await this.passByHome(page, site_key, site_url, code);

    const dataMining = () => {
      const getHtmlById = (id: string) => document.querySelector(id).innerHTML;
      const nodeListTable = document.querySelector('#tableItens')
        .childNodes as any;

      const emitContent = {
        nameFantasy: getHtmlById('#conteudo_lblNomeFantasiaEmitente'),
        nameEmit: getHtmlById('#conteudo_lblNomeEmitente'),
        address: getHtmlById('#conteudo_lblEnderecoEmintente'),
        district: getHtmlById('#conteudo_lblBairroEmitente'),
        zipCode: getHtmlById('#conteudo_lblCepEmitente'),
        city: getHtmlById('#conteudo_lblMunicipioEmitente'),
        cnpj: getHtmlById('#conteudo_lblCnpjEmitente'),
        ie: getHtmlById('#conteudo_lblIeEmitente'),
      };

      const satNumber = getHtmlById('#conteudo_lblSatNumeroSerie');
      const dateEmit = getHtmlById('#conteudo_lblDataEmissao');
      const barCode = getHtmlById('#conteudo_lblIdCfe');

      let table = {};
      for (let node of nodeListTable) {
        table[node.nodeName] = node.innerText;
      }
      return {
        table,
        emitContent,
        satNumber,
        dateEmit,
        barCode,
      };
    };
    // await sleep(10);
    await page.waitForSelector('#tableItens');
    logger('Comecou a minerar html...');
    try {
      let { table, emitContent, satNumber, dateEmit, barCode } =
        await page.evaluate(dataMining);

      const newLocal = {
        dateEmit: treatmentsInnerHtml(dateEmit)[0],
        satNumber: treatmentsInnerHtml(satNumber)[0],
        barCode: treatmentsInnerHtml(barCode)[0],
        emitContent: {
          nameFantasy: treatmentsInnerHtml(emitContent.nameFantasy)[0],
          nameEmit: treatmentsInnerHtml(emitContent.nameEmit)[0],
          address: treatmentsInnerHtml(emitContent.address)[0],
          district: treatmentsInnerHtml(emitContent.district)[0],
          zipCode: treatmentsInnerHtml(emitContent.zipCode)[0],
          city: treatmentsInnerHtml(emitContent.city)[0],
          cnpj: treatmentsInnerHtml(emitContent.cnpj)[0],
          ie: treatmentsInnerHtml(emitContent.ie)[0],
        },
        products: treatmentsTable(table),
      };
      const dateProcess = new Date().toLocaleString('en', {
        timeZone: 'America/Sao_Paulo',
      });
      const newObject = {
        date_processed: dateProcess,
        nota: newLocal,
        status: true,
      };

      logger(`Salvando no banco a nota ${code} as ${dateProcess}`);
      await this.repository.update({ code }, newObject);
      logger(`Salvo com sucesso a nota ${code}`);
    } catch (error) {
      logger('Erro ao minerar html');
      throw new BadRequestException(error);
    }
  }

  async passByHome(page, site_key, site_url, code) {
    let captcha_token = await resolve_captcha_v2(site_key, site_url, code);
    if (!captcha_token) return logger('Falha ao obter o TOKEN 😤');
    logger('Passou do captcha');
    await page.type(SELECTORS_HOME.inputCode, ' ' + code);
    logger('Está digitando...');
    await page.evaluate(insertCaptchaCode, SELECTORS_HOME, captcha_token);
    logger('Fez o submit do formulario');
    await page.evaluate(submitHome, SELECTORS_HOME);
    logger('Esta aguardando o resultado...');
    await page.click('[id="my-submit"]');
  }
}

function submitHome(SELECTORS_HOME) {
  const input = document.querySelector(SELECTORS_HOME.inputSearch);
  input.removeAttribute('disabled');
  input.setAttribute('id', 'my-submit');
}

function insertCaptchaCode(SELECTORS_HOME, captcha_token) {
  document.getElementById(SELECTORS_HOME.inputCaptcha).innerHTML =
    captcha_token;
}

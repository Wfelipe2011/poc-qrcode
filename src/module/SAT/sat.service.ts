import { BadRequestException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { logger } from 'skyot';
import { User } from 'src/database/entity/UserEntity';
import { Repository } from 'src/database/repository/Repository';
import { NotesBody } from './../../app.controller';
import {
  SELECTORS_CONFIG,
  SELECTORS_HOME,
  SELECTORS_NOTES,
} from './entities/Selectors';
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
      headless: true,
      slowMo: 50,
    });
    const page = await browser.newPage();
    await page.goto(SELECTORS_CONFIG.site_url, {
      waitUntil: 'domcontentloaded',
    });
    await this.passByHome(
      page,
      SELECTORS_CONFIG.site_key,
      SELECTORS_CONFIG.site_url,
      code,
    );
    // await sleep(10);
    await page.waitForSelector('#tableItens');
    logger('Comecou a minerar html...');
    try {
      let htmlMining = await page.evaluate(dataMining, SELECTORS_NOTES);
      const entityNotes = newNotesEntities(htmlMining);
      logger(
        `Salvando no banco a nota ${code} as ${entityNotes.date_processed}`,
      );
      await this.repository.update({ code }, entityNotes);
      logger(`Salvo com sucesso a nota ${code}`);
      browser.close();
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

function newNotesEntities(htmlMining) {
  const { table, emitContent, satNumber, dateEmit, barCode } = htmlMining;
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
      cape: treatmentsInnerHtml(emitContent.cnpj)[0],
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
  return newObject;
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

function dataMining(SELECTORS_NOTES) {
  const getHtmlById = (id: string) => document.querySelector(id).innerHTML;
  const nodeListTable = document.querySelector(SELECTORS_NOTES.tableItems)
    .childNodes as any;

  const emitContent = {
    nameFantasy: getHtmlById(SELECTORS_NOTES.nameFantasy),
    nameEmit: getHtmlById(SELECTORS_NOTES.nameEmit),
    address: getHtmlById(SELECTORS_NOTES.address),
    district: getHtmlById(SELECTORS_NOTES.district),
    zipCode: getHtmlById(SELECTORS_NOTES.zipCode),
    city: getHtmlById(SELECTORS_NOTES.city),
    cnpj: getHtmlById(SELECTORS_NOTES.cnpj),
    ie: getHtmlById(SELECTORS_NOTES.ie),
  };

  const satNumber = getHtmlById(SELECTORS_NOTES.satNumber);
  const dateEmit = getHtmlById(SELECTORS_NOTES.dateEmit);
  const barCode = getHtmlById(SELECTORS_NOTES.barCode);

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
}

import { NotesBody } from 'src/app.controller';
import { treatmentsInnerHtml, treatmentsTable } from './treatments';

function newNotesEntities(htmlMining: {
  table: any;
  emitContent: any;
  satNumber: any;
  dateEmit: any;
  barCode: any;
}) {
  const { table, emitContent, satNumber, dateEmit, barCode } = htmlMining;
  const newNotes = {
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
  const dateProcessed = new Date();
  const newEntity: NotesBody = {
    dateProcessed,
    note: newNotes,
    status: 'success',
  };
  return newEntity;
}

function submitHome(SELECTORS_HOME: { inputSearch: any }) {
  const input = document.querySelector(SELECTORS_HOME.inputSearch);
  input.removeAttribute('disabled');
  input.setAttribute('id', 'my-submit');
}

function insertCaptchaCode(
  SELECTORS_HOME: { inputCaptcha: string },
  captcha_token: string,
) {
  document.getElementById(SELECTORS_HOME.inputCaptcha).innerHTML =
    captcha_token;
}

function dataMining(SELECTORS_NOTES: {
  tableItems: any;
  nameFantasy: string;
  nameEmit: string;
  address: string;
  district: string;
  zipCode: string;
  city: string;
  cnpj: string;
  ie: string;
  satNumber: string;
  dateEmit: string;
  barCode: string;
}) {
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

export { dataMining, insertCaptchaCode, newNotesEntities, submitHome };

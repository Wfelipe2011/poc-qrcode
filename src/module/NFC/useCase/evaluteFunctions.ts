export function treatmentsTableProducts(table): any[] {
  function generateProducts(text, index) {
    const listSplit = text?.split(/\n/);
    const obj = {
      '#': index + 1,
      COD: listSplit[5].trim(),
      DESCRIÇÃO: listSplit[2].trim(),
      QTD: listSplit[10].split(':')[1].trim(),
      UN: listSplit[12].split(':')[1].trim(),
      VL_UN_R$: listSplit[16].trim(),
      '(VL_TR_R$)*': null,
      VL_ITEM_R$: listSplit[20].trim(),
    };
    return obj;
  }

  const products = [];
  let index = 0;
  for (let key in table['TBODY']) {
    products.push(generateProducts(table['TBODY'][key], index));
    index++;
  }
  return products;
}

export function treatmentsTableInfo(text) {
  const listSplit = text.split(/\n/)[8].split(' ').filter(Boolean);
  const obj = {
    dateEmit: listSplit[5] + ' - ' + listSplit[6],
    satNumber: listSplit[1],
    barCode: null,
  };
  return obj;
}

export function miningProduct(NFC_SELECTORS_NOTES) {
  const nodeListTable = document.querySelector(NFC_SELECTORS_NOTES.tableItems)
    .childNodes as any;
  let table = {};
  let obj = {};
  for (let node of nodeListTable) {
    for (let [index, n] of node.childNodes.entries()) {
      if (n.nodeName !== '#text') obj[n.nodeName + index] = n.innerText;
    }
    if (node.nodeName !== '#text') table[node.nodeName] = obj;
  }

  const text = document.querySelector(NFC_SELECTORS_NOTES.info)
    .innerText as any;

  return { table, text };
}

export function treatmentsTableEmitent(html) {
  const getRegexValue = (regex: RegExp) => regex.exec(html)[1];

  const NAME_FANTASY = /<label>Nome Fantasia<\/label>\n.+?<span>(.*)<\/span>/;
  const NAME_EMIT =
    /<label>Nome \/ Razão Social<\/label>\n.+?<span>(.*)<\/span>/;
  const ADRESS = /<label>Endereço<\/label>\n.+?<span>(.*\n.*\n.*)?<\/span>/;
  const DISTRICT = /<label>Bairro \/ Distrito<\/label>\n.+?<span>(.*)<\/span>/;
  const ZIP_CODE = /<label>CEP<\/label>\n.+?<span>(.*)<\/span>/;
  const CITY = /<label>Município<\/label>\n.+?<span>(.*\n.*\n.*)?<\/span>/;
  const CNPJ = /<label>CNPJ<\/label>\n.+?<span>(.*)<\/span>/;
  const IE = /<label>Inscrição Municipal<\/label>\n.+?<span>(.*)<\/span>/;

  const emitContent = {
    nameFantasy: getRegexValue(NAME_FANTASY),
    nameEmit: getRegexValue(NAME_EMIT),
    address: getRegexValue(ADRESS).replace(/\n+|&nbsp|;|(  )/g, ''),
    district: getRegexValue(DISTRICT),
    zipCode: getRegexValue(ZIP_CODE),
    city: getRegexValue(CITY)
      .replace(/\n+|&nbsp|;|(  )/g, '')
      .trim(),
    cnpj: getRegexValue(CNPJ),
    ie: getRegexValue(IE),
  };
  return emitContent;
}

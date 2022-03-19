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

export function treatmentsTableEmitent(text) {
  const listSplit = text.split(/\n/);
  console.log(listSplit);

  const emitContent = {
    nameFantasy: null,
    nameEmit: text[1]?.trim(),
    address: listSplit.slice(5, 8).toString().replace(/\t/g, '')?.trim(),
    district: listSplit[11]?.trim(),
    zipCode: null,
    city: listSplit[13]?.trim(),
    cnpj: listSplit[4]?.trim(),
    ie: null,
  };
  return emitContent;
}

export function treatmentsTable(obj) {
  function replaceToString(string) {
    return string.replace(/\t/g, ';').replace(/\n/g, '')?.split(';');
  }

  const thead = replaceToString(obj.THEAD);

  const tbody = replaceToString(obj.TBODY);

  const products = [];

  let result = {};
  let count = 0;
  tbody.forEach((item) => {
    const index = thead[count].replace(/( )+/g, '_');
    result[index] = item;
    count++;

    if (count == 8) {
      count = 0;
      products.push(result);
      result = {};
    }
  });

  return products;
}

export function treatmentsEmitContent(array: string[]) {
  const sanitize = (text) => text.replace(/( -)/, '').replace(/( )?/, '');
  return {
    nameFantasy: sanitize(array[0]),
    nameEmit: sanitize(array[1]),
    address: sanitize(array[2]),
    district: sanitize(array[3]),
    zipCode: sanitize(array[4]),
    city: sanitize(array[5]),
    state: sanitize(array[6]),
    cnpj: array[7],
    ie: array[8],
  };
}

export function treatmentsInnerHtml(contentInnerHtml): string[] {
  const charNotAceptions = [' ', '-', ''];
  const regexHtml = /(<([^>]+)>)/gi;
  const regexSpace = /(\r\n|\n|\r)/gm;
  const contentList = contentInnerHtml
    .replace(regexHtml, '')
    .replace(regexSpace, ';')
    .replace(/( )+;/g, '')
    .replace(/( )+/g, ' ')
    .replace(/&nbsp/g, '')
    .split(';')
    .filter((item) => !charNotAceptions.includes(item));
  return contentList;
}

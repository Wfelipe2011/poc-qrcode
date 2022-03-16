export const sliceList = (itens, max): any[] => {
  return itens.reduce((result, item, indice) => {
    const group = Math.floor(indice / max);
    result[group] = [...(result[group] || []), item];
    return result;
  }, []);
};

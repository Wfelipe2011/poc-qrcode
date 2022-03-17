export const diffDays = (dateFrom, dateTo) => {
  const timeDiff = Math.abs(dateTo.getTime() - dateFrom.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

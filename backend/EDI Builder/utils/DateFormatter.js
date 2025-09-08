function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.getFullYear().toString() +
         String(d.getMonth() + 1).padStart(2, '0') +
         String(d.getDate()).padStart(2, '0');
}

// Example for range
function buildDateTimePeriod(fromDate, toDate) {
  const from = formatDate(fromDate);
  const to = formatDate(toDate);
  return to ? `${from}-${to}` : from;
}

export { formatDate, buildDateTimePeriod };
export function formatDateYYMMDD(date) {
  return new Date(date).toISOString().slice(2, 10).replace(/-/g, '');
}

export function formatDateYYYYMMDD(date) {
  return new Date(date).toISOString().slice(0, 10).replace(/-/g, '');
}

export function formatTimeHHMM(date) {
  return new Date(date).toTimeString().slice(0, 5).replace(':', '');
}

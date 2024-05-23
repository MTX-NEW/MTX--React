export function handleUseQuery(signal: AbortSignal, callback: Function) {
  return callback.bind(null, signal);
}

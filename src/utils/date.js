export function isISO8601(dateString) {
  const iso8601Regex =
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(.\d+)?(Z|([+-]\d{2}:\d{2})))?$/;
  return iso8601Regex.test(dateString);
}

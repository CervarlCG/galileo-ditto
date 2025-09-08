export function formatMoney(amount, currency = "USD") {
  return new Intl.NumberFormat("en-CR", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

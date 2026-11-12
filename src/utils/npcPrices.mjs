const positive = value => /^[0-9]+$/.test(String(value)) && BigInt(value) > 0n;
export function priceState(row, references = [], automatic = row.automatic) {
  const quote = references.find(r => r.item_id === row.item_id)?.price;
  const available = positive(quote);
  const next = {
    ...row,
    automatic: Boolean(automatic && available),
    auto_available: available
  };
  if (automatic && available) {
    next.buy_price = String(quote);
    next.sell_price = String(BigInt(quote) * 80n / 100n || 1n);
  } else if (row.automatic && !available) {
    next.buy_price = '0';
    next.sell_price = '0';
  }
  next.price_required = Boolean(next.buy_enabled && !positive(next.buy_price) || next.sell_enabled && !positive(next.sell_price));
  return next;
}

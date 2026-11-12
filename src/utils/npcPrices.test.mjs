import test from 'node:test';
import assert from 'node:assert/strict';
import { priceState } from './npcPrices.mjs';
const row = {
  item_id: 'minecraft:candle',
  automatic: true,
  buy_enabled: true,
  sell_enabled: false,
  buy_price: '0',
  sell_price: '0'
};
test('No reference or city quote means manual draft requiring a price', () => {
  for (const refs of [[], [{
    item_id: row.item_id,
    price: null
  }]]) {
    const next = priceState(row, refs);
    assert.equal(next.automatic, false);
    assert.equal(next.price_required, true);
    assert.equal(next.buy_price, '0');
  }
});
test('Known quote enables automatic mode, retaining exact integer monetary values', () => {
  const next = priceState(row, [{
    item_id: row.item_id,
    price: '12345678901234567'
  }]);
  assert.equal(next.automatic, true);
  assert.equal(next.buy_price, '12345678901234567');
  assert.equal(next.sell_price, '9876543120987653');
});
test('Manual price survives market quote changes and disabled sides need no price', () => {
  const next = priceState({
    ...row,
    automatic: false,
    buy_price: '12'
  }, [{
    item_id: row.item_id,
    price: '67'
  }]);
  assert.equal(next.buy_price, '12');
  assert.equal(next.automatic, false);
  assert.equal(next.price_required, false);
  assert.equal(priceState({
    ...next,
    sell_enabled: true
  }).price_required, true);
});
test('Bulk automatic mode keeps a manually priced item when its reference is absent', () => {
  const next = priceState({
    ...row,
    automatic: false,
    buy_price: '42'
  }, [], true);
  assert.equal(next.automatic, false);
  assert.equal(next.buy_price, '42');
  assert.equal(next.price_required, false);
});

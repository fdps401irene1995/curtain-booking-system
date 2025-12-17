export function discountFromLayers(layers: number): number {
  // Simple, readable reward curve (NT$): encourages stacking without exploding.
  // 0-3: +10 each, 4-8: +15 each, 9+: +20 each, capped at 200.
  if (layers <= 0) return 0;
  let amount = 0;
  for (let i = 1; i <= layers; i++) {
    if (i <= 3) amount += 10;
    else if (i <= 8) amount += 15;
    else amount += 20;
  }
  return Math.min(amount, 200);
}

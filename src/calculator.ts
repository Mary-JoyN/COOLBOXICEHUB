import { CalculationInput, CalculationResult } from './types';

export function calculateSupplies(input: CalculationInput): CalculationResult {
  const { guests, reserve, icePerGuest, bagKg, waterPerGuest, bottleMl, icePrice, waterPrice } = input;

  if (!Number.isInteger(guests) || guests < 1 || guests > 100000) {
    throw new Error('Enter a valid whole number of guests between 1 and 100,000.');
  }

  if (reserve < 0 || reserve > 100) {
    throw new Error('Reserve buffer must be between 0% and 100%.');
  }

  if (icePerGuest < 0 || icePerGuest > 100 || waterPerGuest < 0 || waterPerGuest > 100) {
    throw new Error('Per-guest allowances must be non-negative numbers.');
  }

  if (bagKg <= 0 || bottleMl <= 0) {
    throw new Error('Pack sizes must be greater than zero.');
  }

  const multiplier = 1 + reserve / 100;
  const iceKg = guests * icePerGuest * multiplier;
  const waterLitres = guests * waterPerGuest * multiplier;

  const bags = Math.max(0, Math.ceil(iceKg / bagKg - 1e-9));
  const bottles = Math.max(0, Math.ceil((waterLitres * 1000) / bottleMl - 1e-9));

  const packedIceKg = bags * bagKg;
  const packedWaterLitres = (bottles * bottleMl) / 1000;

  const iceCost = icePrice === null ? null : bags * icePrice;
  const waterCost = waterPrice === null ? null : bottles * waterPrice;
  const total = iceCost === null || waterCost === null ? null : iceCost + waterCost;

  return {
    iceKg,
    waterLitres,
    bags,
    bottles,
    packedIceKg,
    packedWaterLitres,
    iceCost,
    waterCost,
    total,
  };
}

export function formatCurrency(amount: number): string {
  return 'N$' + amount.toFixed(2);
}

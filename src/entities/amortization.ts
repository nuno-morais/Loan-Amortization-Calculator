import Big from 'big.js';

export class Amortization {
  constructor(
    public readonly value = Big(0),
    public readonly accumulated = false,
    public readonly cadency = 1,
    public readonly fee = Big(0.02),
  ) {}
}

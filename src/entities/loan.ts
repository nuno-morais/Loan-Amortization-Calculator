import Big from 'big.js';

export class Payment {
  public constructor(
    public readonly payment: Big,
    public readonly interest: Big,
  ) {}

  public static Empty = new Payment(Big(0), Big(0));
}

export class Loan {
  private readonly interestPerMonth: Big;

  public totalInstalmentInterest = Big(0);
  public totalAmortizationInterest = Big(0);

  constructor(
    public readonly interest: Big,
    public debt: Big,
    public installments: Big,
    public otherComissions: Big,
  ) {
    this.interestPerMonth = interest.div(12);
  }

  public pay(): Payment {
    const currentPayment = this.monthlyPayment();
    const currentInterest = this.debt.mul(this.interestPerMonth);
    this.installments = this.installments.minus(1);
    this.debt = this.debt.minus(currentPayment.minus(currentInterest));
    this.totalInstalmentInterest = this.totalInstalmentInterest
      .plus(currentInterest)
      .plus(this.otherComissions);

    return new Payment(currentPayment, currentInterest);
  }

  public amortize(value: Big, fee: Big): Payment {
    const paymentValue = value.div(fee.plus(Big(1)));
    if (paymentValue.gt(this.debt)) {
      const paymentFee = this.debt.mul(Big(1).plus(fee)).minus(this.debt);
      this.totalAmortizationInterest =
        this.totalAmortizationInterest.plus(paymentFee);
      this.debt = this.debt.minus(this.debt);

      return new Payment(this.debt.plus(paymentFee), fee);
    }

    const paymentFee = value.minus(paymentValue);
    this.debt = this.debt.minus(paymentValue);
    this.totalAmortizationInterest =
      this.totalAmortizationInterest.plus(paymentFee);

    return new Payment(paymentValue, paymentFee);
  }

  private monthlyPayment(): Big {
    const amortized = Big(1)
      .minus(Big(1).plus(this.interestPerMonth).pow(-this.installments))
      .div(this.interestPerMonth);

    return this.debt.div(amortized);
  }
}

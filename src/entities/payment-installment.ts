import Big from 'big.js';
import { Loan, Payment } from './loan';

export class PaymentInstallment extends Payment {
  public readonly debt: Big;
  public readonly amortizationPayment: Big;
  public readonly installmentPayment: Big;
  public readonly amortizationInterest: Big;
  public readonly instalmentInterest: Big;
  public readonly totalAmortizationInterest: Big;
  public readonly totalInstalmentInterest: Big;

  constructor(
    public readonly installment: number,
    loan: Loan,
    installmentPayment: Payment,
    amortizationPayment: Payment,
  ) {
    const payment = installmentPayment.payment.plus(
      amortizationPayment.payment,
    );
    const interest = installmentPayment.interest.plus(
      amortizationPayment.interest,
    );
    super(payment, interest);
    this.debt = loan.debt;
    this.installmentPayment = installmentPayment.payment;
    this.amortizationPayment = amortizationPayment.payment;
    this.instalmentInterest = installmentPayment.interest;
    this.amortizationInterest = amortizationPayment.interest;
    this.totalInstalmentInterest = loan.totalInstalmentInterest;
    this.totalAmortizationInterest = loan.totalAmortizationInterest;
  }

  public pretty(): Object {
    const obj = {};
    for (const [key, value] of Object.entries(this)) {
      if (value instanceof Big) {
        obj[key] = value.toFixed(2);
      } else {
        obj[key] = value;
      }
    }

    return obj;
  }
}

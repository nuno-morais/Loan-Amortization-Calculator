import { Loan, Payment } from './../entities/loan';
import Big from 'big.js';
import { PaymentInstallment } from './../entities/payment-installment';
import { Injectable } from '@nestjs/common';
import { Amortization } from 'src/entities/amortization';

export class LoanManagerInput {
  constructor(
    public readonly interest: Big,
    public readonly debt: Big,
    public readonly installments: Big,
    public readonly amortization: Amortization = null,
    public readonly otherComissions: Big = Big(0),
  ) {}
}

@Injectable()
export class LoanManager {
  private loan: Loan;
  private installmentsCounter = 0;
  private amortization: Amortization = null;

  public start(input: LoanManagerInput) {
    this.installmentsCounter = 0;
    this.loan = new Loan(
      input.interest,
      input.debt,
      input.installments,
      input.otherComissions,
    );
    this.amortization = input.amortization;

    const payments: PaymentInstallment[] = [];

    while (this.loan.debt.gt(0)) {
      this.installmentsCounter++;

      const payment = this.loan.pay();
      const firstPayment =
        payments.length > 0 ? payments[0].installmentPayment : payment.payment;
      const amortizationPayment = this.applyAmortization(
        firstPayment,
        payment.payment,
      );

      const paymentInstallment = new PaymentInstallment(
        this.installmentsCounter,
        this.loan,
        payment,
        amortizationPayment,
      );
      payments.push(paymentInstallment);
    }

    return payments;
  }

  private applyAmortization(firstPayment: Big, currentPayment: Big): Payment {
    if (this.amortization == null || this.amortization.value.lte(0)) {
      return Payment.Empty;
    }

    if (
      !Big(this.installmentsCounter - 1)
        .mod(this.amortization.cadency)
        .eq(0)
    ) {
      return Payment.Empty;
    }

    if (this.amortization.accumulated) {
      return this.loan.amortize(
        this.amortization.value.plus(
          firstPayment.minus(currentPayment).mul(this.amortization.cadency),
        ),
        this.amortization.fee,
      );
    } else {
      return this.loan.amortize(this.amortization.value, this.amortization.fee);
    }
  }
}

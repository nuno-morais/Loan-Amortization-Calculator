import { Command, CommandRunner, Option } from 'nest-commander';
import { printTable } from 'console-table-printer';
import { LoanManager, LoanManagerInput } from './../services/loan-manager';
import Big from 'big.js';
import { Amortization } from './../entities/amortization';

interface LoanCommandOptions {
  debt: number;
  interest: number;
  installments: number;
  amortizationFee?: number;
  amortizationAccumulated?: boolean;
  amortizationCadency?: number;
  amortizationValue?: number;
  otherComissions?: number;
}

@Command({ name: 'loan', description: 'Calculate loan with amortization' })
export class LoanCommand extends CommandRunner {
  constructor(private readonly loanManager: LoanManager) {
    super();
  }

  async run(passedParam: string[], options?: LoanCommandOptions) {
    const interest = Big(options?.interest || 0.01602);
    const debt = Big(options?.debt || 168483.15);
    const installments = Big(options?.installments || 331);
    const fee = Big(options?.amortizationFee || 0.005);
    const otherComissions = Big(options?.otherComissions);

    const amortization = new Amortization(
      Big(options?.amortizationValue || 0),
      options?.amortizationAccumulated || false,
      options?.amortizationCadency || 1,
      fee,
    );
    const result = this.loanManager.start(
      new LoanManagerInput(
        interest,
        debt,
        installments,
        amortization,
        otherComissions,
      ),
    );
    const noAmortizationResult = this.loanManager.start(
      new LoanManagerInput(interest, debt, installments, null, otherComissions),
    );

    printTable(result.map((v) => v.pretty()));
    const amortizationResult = result[result.length - 1];
    const nonAmortizationResult =
      noAmortizationResult[noAmortizationResult.length - 1];

    const final = {
      'Money saved': `${nonAmortizationResult.totalInstalmentInterest
        .minus(
          amortizationResult.totalInstalmentInterest.plus(
            amortizationResult.totalAmortizationInterest,
          ),
        )
        .toFixed(2)}€`,
      'Period saved': `${
        nonAmortizationResult.installment - amortizationResult.installment
      } (${
        (nonAmortizationResult.installment - amortizationResult.installment) /
        12
      }years)`,
    };
    printTable([final]);
  }

  @Option({
    flags: '-d, --debt [debt]',
    description: 'Quantity in debt',
  })
  parseDebt(val: string): number {
    return Number(val);
  }

  @Option({
    flags: '-i, --interest [interest]',
    description: 'Quantity in interest',
  })
  parseInterest(val: string): number {
    return Number(val);
  }

  @Option({
    flags: '-p, --installments [installments]',
    description: 'Installments',
  })
  parseInstallments(val: string): number {
    return Number(val);
  }

  @Option({
    flags: '-af, --amortizationFee [amortizationFee]',
    description: 'Amortization fee',
  })
  parseAmortizationFee(val: string): number {
    return Number(val) || 0.02;
  }

  @Option({
    flags: '-aa, --amortizationAccumulated [amortizationAccumulated]',
    description: 'Amortization Accumulated',
  })
  parseAmortizationAccumulated(val: string): boolean {
    return JSON.parse(val) || false;
  }

  @Option({
    flags: '-ac, --amortizationCadency [amortizationCadency]',
    description: 'Amortization Cadency',
  })
  parseAmortizationCadency(val: string): number {
    return Number(val) || 1;
  }

  @Option({
    flags: '-av, --amortizationValue [amortizationValue]',
    description: 'Amortization Value',
  })
  parseAmortizationValue(val: string): number {
    return Number(val) || 0;
  }

  @Option({
    flags: '-oc, --otherComissions [otherComissions]',
    description: 'Other Comissions',
  })
  parseOtherComissions(val: string): number {
    return Number(val) || 0;
  }
}

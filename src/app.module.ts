import { Module } from '@nestjs/common';
import { LoanCommand } from './commands/loan.command';
import { LoanManager } from './services/loan-manager';

@Module({
  imports: [],
  controllers: [],
  providers: [LoanManager, LoanCommand],
})
export class AppModule {}

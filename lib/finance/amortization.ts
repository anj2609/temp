import type {
  AmortizationResult,
  AmortizationRow,
  LoanInputs,
  Prepayment,
} from "@/types/domain";
import { calculateEmi } from "./emi";

function groupPrepaymentsByMonth(prepayments: Prepayment[]): Map<number, number> {
  const byMonth = new Map<number, number>();
  for (const p of prepayments) {
    if (p.amount <= 0) continue;
    byMonth.set(p.month, (byMonth.get(p.month) ?? 0) + p.amount);
  }
  return byMonth;
}

export function buildAmortizationSchedule(
  inputs: LoanInputs,
  prepayments: Prepayment[] = []
): AmortizationResult {
  const { principal, annualRate, tenureMonths } = inputs;
  const rows: AmortizationRow[] = [];

  if (principal <= 0 || tenureMonths <= 0) {
    return { rows, totalInterest: 0, totalPrincipal: 0, totalPaid: 0 };
  }

  const monthlyRate = annualRate / 12 / 100;
  const emi = calculateEmi(principal, annualRate, tenureMonths);
  const byMonth = groupPrepaymentsByMonth(prepayments);

  let balance = principal;
  let totalInterest = 0;
  let totalPrincipal = 0;

  for (let month = 1; month <= tenureMonths && balance > 0; month++) {
    const requestedPrepayment = byMonth.get(month) ?? 0;
    const prepayment = Math.min(requestedPrepayment, balance);
    balance -= prepayment;
    totalPrincipal += prepayment;

    if (balance <= 0) {
      rows.push({
        month,
        emi: prepayment,
        principalPaid: prepayment,
        interestPaid: 0,
        prepayment,
        balance: 0,
      });
      break;
    }

    const interestPaid = balance * monthlyRate;
    let principalPaid = emi - interestPaid;

    if (principalPaid >= balance) {
      principalPaid = balance;
    }

    balance -= principalPaid;
    totalInterest += interestPaid;
    totalPrincipal += principalPaid;

    rows.push({
      month,
      emi: principalPaid + interestPaid + prepayment,
      principalPaid: principalPaid + prepayment,
      interestPaid,
      prepayment,
      balance,
    });
  }

  return {
    rows,
    totalInterest,
    totalPrincipal,
    totalPaid: totalInterest + totalPrincipal,
  };
}

export function findBreakEvenMonth(rows: AmortizationRow[]): number | null {
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;

  for (const row of rows) {
    cumulativePrincipal += row.principalPaid;
    cumulativeInterest += row.interestPaid;
    if (cumulativePrincipal > cumulativeInterest) {
      return row.month;
    }
  }

  return null;
}

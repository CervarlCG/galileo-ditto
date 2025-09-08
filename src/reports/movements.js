import { ProsoftMovements } from "../lib/prosoft/movements.js";
import { MovementsService } from "../services/movements.js";
import { TransactionRecordsService } from "../services/transaction-records.js";
import { formatMoney } from "../utils/money.js";
import ora from "ora";

export class MovementsReport {
  constructor(account, movements) {
    this.movementsService = new MovementsService(movements);
    this.transactionRecordsService = new TransactionRecordsService(account);
    this.movementsFetcher = new ProsoftMovements();
  }

  getCredits = async () => {
    const spinner = ora("Processing credits...").start();
    const records = await this.transactionRecordsService.getCredits();
    const creditMovements = await this.movementsService.getCredits();
    const notFound = this.getMovementsNotFound(creditMovements, records);
    const total = creditMovements.reduce((acc, m) => acc + m.Monto, 0);
    spinner.succeed();
    return {
      total,
      notFound,
      totalStyled: formatMoney(total, this.currency),
      count: creditMovements.length,
      details: creditMovements.map((m) => ({
        ...m,
        Monto: formatMoney(m.Monto, this.currency),
      })),
    };
  };

  getDebits = async () => {
    const spinner = ora("Processing debits...").start();
    const records = await this.transactionRecordsService.getDebits();
    const debitMovementsGrouped = await this.movementsService.getDebits();
    const notFound = this.getMovementsNotFound(debitMovementsGrouped, records);
    const total = debitMovementsGrouped.reduce(
      (acc, m) => acc + m.Monto + m.Comision,
      0
    );
    spinner.succeed();
    return {
      total,
      notFound,
      totalStyled: formatMoney(total, this.currency),
      count: debitMovementsGrouped.length,
      details: debitMovementsGrouped,
    };
  };

  getMovementsNotFound = (movements, records) => {
    const notFound = [];
    for (const dm of movements) {
      const found = records.find(
        dm.NumReferenciaSP
          ? (r) =>
              r.provider_response?.data?.PINSendingResult?.SINPERefNumber ===
                dm.NumReferenciaSP ||
              r.provider_response?.Result?.SINPERefNumber ===
                dm.NumReferenciaSP ||
              r.provider_response?.TransferResult?.SINPERefNumber ===
                dm.NumReferenciaSP
          : (r) =>
              r.movement_id === `${dm.NumMovimiento} (Aplicada)` ||
              r.movement_id === `${dm.NumMovimiento} (Revertida)` ||
              r.movement_id === `${dm.NumMovimiento}`
      );
      if (!found) notFound.push(dm);
    }
    return notFound;
  };

  run = async () => {
    const credits = await this.getCredits();
    const debits = await this.getDebits();

    return {
      summary: {
        credits: {
          total: credits.totalStyled,
          count: credits.count,
          notFound: credits.notFound.length,
        },
        debits: {
          total: debits.totalStyled,
          count: debits.count,
          notFound: debits.notFound.length,
        },
      },
      data: {
        debits,
        credits,
      },
    };
  };
}

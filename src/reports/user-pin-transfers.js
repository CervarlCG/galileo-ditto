import { TransactionRecordsService } from "../services/transaction-records.js";
import { formatMoney } from "../utils/money.js";

export class UserPINTransfersReport {
  constructor(account, movements, opts) {
    this.account = account;
    this.movements = movements;
    this.opts = {
      ...opts,
      startDate: opts.startDate.add(1, "hour"),
      endDate: opts.endDate.subtract(1, "hour"),
    };
  }

  run = async () => {
    const transactionRecordsService = new TransactionRecordsService(
      this.account,
      this.opts
    );
    const pinTransfers =
      await transactionRecordsService.getOutgoingPINTransfers();
    const pinTransfersNotFound = [];
    const pinRefs = pinTransfers
      .map((pt) => ({
        id:
          pt.provider_response?.data?.PINSendingResult?.SINPERefNumber ||
          pt.provider_response?.Result?.SINPERefNumber ||
          pt.provider_response?.TransferResult?.SINPERefNumber,
        date: pt.created_at,
        amount: pt.amount,
        transactionId: pt.transaction_id,
      }))
      .filter((ref) => !!ref.id);

    pinRefs.forEach((pinRef) => {
      const m = this.movements.find((m) => m.NumReferenciaSP === pinRef.id);
      if (!m) pinTransfersNotFound.push(pinRef);
    });
    const total = pinRefs.reduce((acc, pt) => acc + parseFloat(pt.amount), 0);

    return {
      summary: {
        pin: {
          count: pinRefs.length,
          totalRaw: total,
          total: formatMoney(total, "USD"),
          notFound: pinTransfersNotFound.length,
        },
      },
      data: {
        pin: {
          details: pinRefs,
          notFound: pinTransfersNotFound,
        },
      },
    };
  };
}

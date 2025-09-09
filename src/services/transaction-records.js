import { client } from "../infrastructure/db.js";

const debitsTransactionsRecordsSql = `
  SELECT tr.*
  FROM transaction_records tr
  INNER JOIN transaction t
    ON tr.transaction_id = t.id
  WHERE ((t.user_from_id = $1 AND t.currency_from_id = $2 and t.status = 'COMPLETED') 
    OR (t.user_to_id = $1 and t.status = 'FAILED' and t.currency_to_id = $2)) AND t.created_at BETWEEN $3 AND $4`;

const creditsTransactionsRecordsSql = `
  SELECT tr.*
  FROM transaction_records tr
  INNER JOIN transaction t
    ON tr.transaction_id = t.id
  WHERE 
    (t.user_to_id = $1 AND t.currency_to_id = $2 and (t.status = 'COMPLETED' or t.status = 'FAILED'))
    AND t.created_at BETWEEN $3 AND $4`;

const outgoingPINTransfersSql = `
  SELECT tr.*
  FROM transaction_records tr
  INNER JOIN transaction t
    ON tr.transaction_id = t.id
  WHERE 
    t.account_number_from = $1 AND t.user_to_id IS NULL AND t.currency_from_id = $2 and t.status = 'COMPLETED'
    AND t.created_at BETWEEN $3 AND $4
`;

export class TransactionRecordsService {
  constructor(account, opts) {
    this.account = account;
    this.opts = opts;
  }

  getCredits = async () => {
    return this.execute(creditsTransactionsRecordsSql, [
      this.account.userId,
      this.account.currency.id,
      this.opts.startDate.toISOString(),
      this.opts.endDate.toISOString(),
    ]);
  };

  getDebits = async () => {
    return this.execute(debitsTransactionsRecordsSql, [
      this.account.userId,
      this.account.currency.id,
      this.opts.startDate.toISOString(),
      this.opts.endDate.toISOString(),
    ]);
  };

  getOutgoingPINTransfers = async () => {
    return this.execute(outgoingPINTransfersSql, [
      this.account.accountNumber,
      this.account.currency.id,
      this.opts.startDate.toISOString(),
      this.opts.endDate.toISOString(),
    ]);
  };

  async execute(query, params) {
    const result = await client.query(query, params);
    return result.rows;
  }
}

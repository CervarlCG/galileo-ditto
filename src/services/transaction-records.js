import { client } from "../infrastructure/db.js";

const debitsTransactionsRecordsSql = `
  SELECT tr.*
  FROM transaction_records tr
  INNER JOIN transaction t
    ON tr.transaction_id = t.id
  WHERE (t.user_from_id = $1 AND t.currency_from_id = $2 and t.status = 'COMPLETED') 
    OR (t.user_to_id = $1 and t.status = 'FAILED' and t.currency_to_id = $2)`;

const creditsTransactionsRecordsSql = `
  SELECT tr.*
  FROM transaction_records tr
  INNER JOIN transaction t
    ON tr.transaction_id = t.id
  WHERE (t.user_to_id = $1 AND t.currency_to_id = $2 and (t.status = 'COMPLETED' or t.status = 'FAILED'))`;

export class TransactionRecordsService {
  constructor(account) {
    this.account = account;
  }

  getCredits = async () => {
    return this.execute(creditsTransactionsRecordsSql, [
      this.account.userId,
      this.account.currency.id,
    ]);
  };

  getDebits = async () => {
    return this.execute(debitsTransactionsRecordsSql, [
      this.account.userId,
      this.account.currency.id,
    ]);
  };

  async execute(query, params) {
    const result = await client.query(query, params);
    return result.rows;
  }
}

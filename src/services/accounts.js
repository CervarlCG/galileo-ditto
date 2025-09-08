import { client } from "../infrastructure/db.js";

const getAccountSql = `
  SELECT u.id as user_id, c.id as currency_id, c.iso as currency_iso, ba.account_number_ccf as external_id FROM "bank_account" ba
  LEFT JOIN "currency" c
    ON c.id = ba.currency_id
  LEFT JOIN "user" u
    ON u.id = ba.user_id
  WHERE account_number_std = $1`;

export class AccountsService {
  getAccount = async (accountNumber) => {
    const account = await this.execute(getAccountSql, [accountNumber]);
    return account[0]
      ? {
          userId: account[0]?.user_id,
          externalId: account[0]?.external_id,
          currency: {
            id: account[0]?.currency_id,
            iso: account[0]?.currency_iso,
          },
        }
      : undefined;
  };

  async execute(query, params) {
    const result = await client.query(query, params);
    return result.rows;
  }
}

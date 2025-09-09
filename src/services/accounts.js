import { client } from "../infrastructure/db.js";

const getAccountSql = `
  SELECT 
    u.id as user_id, 
    c.id as currency_id, 
    c.iso as currency_iso, 
    ba.account_number_ccf as external_id,
    ba.account_number_std as account_number,
    ba.id as id
  FROM "bank_account" ba
  LEFT JOIN "currency" c
    ON c.id = ba.currency_id
  LEFT JOIN "user" u
    ON u.id = ba.user_id
  WHERE account_number_std = $1`;

const listAccountsSql = `
  SELECT 
    u.id as user_id, 
    c.id as currency_id, 
    c.iso as currency_iso, 
    ba.account_number_ccf as external_id,
    ba.account_number_std as account_number,
    ba.id as id
  FROM "bank_account" ba
  LEFT JOIN "currency" c
    ON c.id = ba.currency_id
  LEFT JOIN "user" u
    ON u.id = ba.user_id
  WHERE ($1::bigint IS NULL OR ba.id > $1)
  ORDER BY ba.id ASC
  LIMIT $2 + 1
`;

export class AccountsService {
  getAccount = async (accountNumber) => {
    const account = await this.execute(getAccountSql, [accountNumber]);
    if (!account[0]) throw new Error(`Account ${accountNumber} not found`);
    return this.parse(account[0]);
  };

  listAccounts = async (cursor, limit = 10) => {
    const accounts = await this.execute(listAccountsSql, [cursor, limit]);
    const hasNext = accounts.length > limit;

    return {
      accounts: accounts.map(this.parse),
      hasNext,
      nextCursor: hasNext ? accounts[accounts.length - 2].id : null,
    };
  };

  parse(account) {
    return {
      userId: account.user_id,
      externalId: account.external_id,
      accountNumber: account.account_number,
      currency: {
        id: account.currency_id,
        iso: account.currency_iso,
      },
    };
  }

  async execute(query, params) {
    const result = await client.query(query, params);
    return result.rows;
  }
}

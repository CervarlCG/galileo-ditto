import { client } from "../infrastructure/db.js";

const getBankAccountsSql = `
  SELECT * 
  FROM "bank_account"
  WHERE ($1::bigint IS NULL OR id > $1)
  ORDER BY id ASC
  LIMIT $2 + 1
`;

export class BankAccountsService {
  list = async (cursor, limit = 10) => {
    const accounts = await this.execute(getUsersSql, [cursor, limit]);
    const hasNext = users.length > limit;

    return {
      accounts,
      hasNext,
      nextCursor: hasNext ? accounts[accounts.length - 2].id : null,
    };
  };

  async execute(query, params) {
    const result = await client.query(query, params);
    return result.rows;
  }
}

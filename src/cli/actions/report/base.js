import ora from "ora";
import { AccountsService } from "../../../services/accounts.js";
import { ProsoftMovements } from "../../../lib/prosoft/movements.js";
import { task } from "../../../utils/program.js";
import { formatMoney } from "../../../utils/money.js";

export class BaseReportAction {
  reportForSingleAccount = async (accountNumber, reporterClass, opts) => {
    const accountsService = new AccountsService();
    const account = await task(
      `Fetching account ${accountNumber}...`,
      () => accountsService.getAccount(accountNumber),
      () => process.exit(1)
    );

    return this.getReportForAccount(account, reporterClass, opts);
  };

  reportForMultipleAccounts = async (keys, reporterClass, opts) => {
    const accountsService = new AccountsService();
    const spinner = ora();
    const report = this.getEmptyReport(keys);
    let response = { accounts: [], hasNext: false, nextCursor: null };

    do {
      spinner.text = "Fetching users accounts... page = 1";
      response = await accountsService.listAccounts(response.nextCursor);
      for (const account of response.accounts) {
        const { summary, data } = await this.getReportForAccount(
          account,
          reporterClass,
          opts
        );
        for (const key of keys) {
          report.summary[key].count += summary[key].count;
          report.summary[key].total = formatMoney(
            summary[key].totalRaw + report.summary[key].totalRaw,
            "USD"
          );
          report.summary[key].totalRaw += summary[key].totalRaw;
          report.summary[key].notFound += summary[key].notFound;
          report.data[key].details.push(...data[key].details);
          report.data[key].notFound.push(...data[key].notFound);
        }
      }
    } while (response.hasNext);

    return report;
  };

  getReportForAccount = async (account, reporterClass, opts) => {
    const movementsFetcher = new ProsoftMovements();
    const movements = await task(
      `Fetching movements for account ${JSON.stringify(account)}...`,
      () =>
        movementsFetcher.listAll(account.externalId, {
          startDate: opts.startDate.subtract(6, "hours").toISOString(),
          endDate: opts.endDate.subtract(6, "hours").toISOString(),
        }),
      () => process.exit(1)
    );
    const userPINTransfersReport = new reporterClass(account, movements, opts);
    const data = await userPINTransfersReport.run();
    return data;
  };

  getEmptyReport = (keys) => {
    const summaryBase = { count: 0, total: 0, totalRaw: 0, notFound: 0 };
    const dataBase = { details: [], notFound: [] };
    const report = { summary: {}, data: {} };
    keys.forEach((key) => {
      report.summary[key] = { ...summaryBase };
      report.data[key] = { ...dataBase };
    });
    return report;
  };

  export = async (summary, data, exporter, accountNumber, outDir) => {
    const spinner = ora(`Exporting reports...`).start();
    for (const [key, value] of Object.entries(data)) {
      if (!value.details) continue;

      const filename = `report_${accountNumber}_${key}`;

      await exporter.export({
        data: value.details,
        filename,
        outDir,
      });

      if (value.notFound)
        await exporter.export({
          data: value.notFound,
          filename: `${filename}_not_found`,
          outDir,
        });
    }

    spinner.succeed();

    console.log("Report Summary:");
    console.table(summary);
  };
}

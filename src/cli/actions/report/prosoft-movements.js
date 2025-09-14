import { program } from "commander";
import { UserProsoftMovementsReport } from "../../../reports/user-prosoft-movements.js";
import { AdminProsoftMovementsReport } from "../../../reports/admin-prosoft-movements.js";
import { CSVExporter } from "../../../exporters/csv.js";
import { BaseReportAction } from "./base.js";

const reportStrategies = {
  user: UserProsoftMovementsReport,
  admin: AdminProsoftMovementsReport,
};

const exporterStrategies = {
  csv: CSVExporter,
};

/**
 * Generate a Prosoft movements report.
 * @param {String} accountNumber The account number to generate the report for
 * @param {Object} opts The options for the report generation
 */
export async function generateProsoftMovementsReport(accountNumber, opts) {
  const baseReporter = new BaseReportAction();
  const ExporterClass = exporterStrategies[opts.format];
  const isGlobalReport = accountNumber === "all";
  const reporterClass = reportStrategies[opts.user];
  const isUserReport = opts.user === "user";

  if (!ExporterClass) program.error(`Unknown format type: ${opts.format}`);
  const { data, summary } = isGlobalReport
    ? await baseReporter.reportForMultipleAccounts(
        ["credits", "debits", ...(!isUserReport ? ["fee"] : [])],
        reporterClass,
        opts
      )
    : await baseReporter.reportForSingleAccount(
        accountNumber,
        reporterClass,
        opts
      );

  const exporter = new ExporterClass();
  await baseReporter.export(
    summary,
    data,
    exporter,
    isGlobalReport ? "all" : accountNumber,
    opts.output
  );
  /*



  const accountsService = new AccountsService();
  const movementsFetcher = new ProsoftMovements();
  const ReporterClass = reportStrategies[opts.user];
  const ExporterClass = exporterStrategies[opts.format];
  const baseReporter = new BaseReportAction();

  if (!ReporterClass) program.error(`Unknown user type: ${opts.user}`);
  if (!ExporterClass) program.error(`Unknown format type: ${opts.format}`);

  const account = await task(
    `Fetching account ${accountNumber}...`,
    () => accountsService.getAccount(accountNumber),
    () => process.exit(1)
  );

  const movements = await task(
    `Fetching movements for account ${accountNumber}...`,
    () =>
      movementsFetcher.listAll(account.externalId, {
        startDate: opts.startDate.subtract(6, "hours").toISOString(),
        endDate: opts.endDate.subtract(6, "hours").toISOString(),
      }),
    () => process.exit(1)
  );

  const reporter = new ReporterClass(account, movements, opts);
  const exporter = new ExporterClass();

  const { summary, data } = await reporter.run();
  await baseReporter.export(
    summary,
    data,
    exporter,
    accountNumber,
    opts.output
  );*/
}

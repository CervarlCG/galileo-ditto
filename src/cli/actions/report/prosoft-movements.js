import ora from "ora";
import { program } from "commander";
import { UserProsoftMovementsReport } from "../../../reports/user-prosoft-movements.js";
import { AdminProsoftMovementsReport } from "../../../reports/admin-prosoft-movements.js";
import { CSVExporter } from "../../../exporters/csv.js";
import { AccountsService } from "../../../services/accounts.js";
import { ProsoftMovements } from "../../../lib/prosoft/movements.js";
import { task } from "../../../utils/program.js";

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
  const accountsService = new AccountsService();
  const movementsFetcher = new ProsoftMovements();
  const ReporterClass = reportStrategies[opts.user];
  const ExporterClass = exporterStrategies[opts.format];

  if (!ReporterClass) program.error(`Unknown user type: ${opts.user}`);
  if (!ExporterClass) program.error(`Unknown format type: ${opts.format}`);

  const account = await task(
    `Fetching account ${accountNumber}...`,
    () => accountsService.getAccount(accountNumber),
    () => process.exit(1)
  );

  const movements = await task(
    `Fetching movements for account ${accountNumber}...`,
    () => movementsFetcher.listAll(account.externalId),
    () => process.exit(1)
  );

  const reporter = new ReporterClass(account, movements);
  const exporter = new ExporterClass();

  const { summary, data } = await reporter.run();
  await exportReport(data, exporter, accountNumber, opts.output);

  console.log("Report Summary:");
  console.table(summary);
}

/**
 * Export report data using the specified exporter.
 * @param {Object} data
 * @param {Object} exporter
 * @param {string} accountNumber
 * @param {string} outDir
 */
async function exportReport(data, exporter, accountNumber, outDir) {
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
}

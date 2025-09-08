import ora from "ora";
import { program } from "commander";
import { MovementsReport } from "../reports/movements.js";
import { AdminMovementsReport } from "../reports/admin-movements.js";
import { CSVExporter } from "../exporters/csv.js";
import { AccountsService } from "../services/accounts.js";
import { ProsoftMovements } from "../lib/prosoft/movements.js";

const reportsStrategies = {
  user: MovementsReport,
  admin: AdminMovementsReport,
};

const exporters = {
  csv: CSVExporter,
};

export async function generateReport(accountNumber, opts) {
  const accountsService = new AccountsService();
  const reporterClass = reportsStrategies[opts.user];
  const exporterClass = exporters[opts.format];
  if (!reporterClass) program.error(`Unknown user type: ${opts.user}`);
  if (!exporterClass) program.error(`Unknown format type: ${opts.format}`);

  const spinner = ora(`Fetching account ${accountNumber}...`).start();
  const account = await accountsService.getAccount(accountNumber);
  if (!account) {
    spinner.fail(`Account ${accountNumber} not found.`);
    process.exit(1);
  }
  spinner.succeed(`Fetched account ${accountNumber} successfully.`);
  const spinnerMov = ora(
    `Fetching movements for account ${accountNumber}...`
  ).start();
  const movementsFetcher = new ProsoftMovements();
  const movements = await movementsFetcher.listAll(account.externalId);
  spinnerMov.succeed(
    `Fetched ${movements.length} movements for account ${accountNumber} successfully.`
  );
  const reporter = new reporterClass(account, movements);
  const exporter = new exporterClass();

  const { summary, data } = await reporter.run();

  for (const [key, value] of Object.entries(data)) {
    if (!value.details) continue;
    const filename = `report_${accountNumber}_${key}`;
    const spinner = ora(`Exporting ${key} to file ${filename} ...`).start();
    await exporter.export({
      data: value.details,
      filename,
      outDir: opts.output,
    });
    if (value.notFound) {
      spinner.text = `Exporting ${key} not found to file ${filename}_not_found ...`;
      await exporter.export({
        data: value.notFound,
        filename: `${filename}_not_found`,
        outDir: opts.output,
      });
    }
    spinner.succeed(`Exported ${key} successfully.`);
  }

  console.log("Report Summary:");
  console.table(summary);
}

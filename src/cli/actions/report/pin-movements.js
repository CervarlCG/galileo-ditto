import { CSVExporter } from "../../../exporters/csv.js";
import { UserPINTransfersReport } from "../../../reports/user-pin-transfers.js";
import { BaseReportAction } from "./base.js";

const exporterStrategies = {
  csv: CSVExporter,
};

export async function generatePINMovementsReport(accountNumber, opts) {
  const baseReporter = new BaseReportAction();
  const ExporterClass = exporterStrategies[opts.format];
  const isGlobalReport = accountNumber === "all";

  if (!ExporterClass) program.error(`Unknown format type: ${opts.format}`);

  const { data, summary } = isGlobalReport
    ? await baseReporter.reportForMultipleAccounts(
        ["pin"],
        UserPINTransfersReport,
        opts
      )
    : await baseReporter.reportForSingleAccount(
        accountNumber,
        UserPINTransfersReport,
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
}

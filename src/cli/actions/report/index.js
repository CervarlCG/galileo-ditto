import { program } from "commander";
import { generateProsoftMovementsReport } from "./prosoft-movements.js";

const reportGeneratorActions = {
  "prosoft-movements": generateProsoftMovementsReport,
};

export async function generateReport(reportType, accountNumber, opts) {
  const action = reportGeneratorActions[reportType];
  if (!action) {
    program.error(`Unknown report type: ${reportType}`);
  }
  await action(accountNumber, opts);
}

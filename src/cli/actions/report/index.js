import { program } from "commander";
import { generateProsoftMovementsReport } from "./prosoft-movements.js";
import { generatePINMovementsReport } from "./pin-movements.js";
import dayjs from "dayjs";

const reportGeneratorActions = {
  "prosoft-movements": generateProsoftMovementsReport,
  "pin-transfers": generatePINMovementsReport,
};

export async function generateReport(reportType, accountNumber, opts) {
  const action = reportGeneratorActions[reportType];
  if (!action) {
    program.error(`Unknown report type: ${reportType}`);
  }
  const startDate = dayjs(opts.startDate);
  const endDate = opts.endDate
    ? dayjs(opts.endDate)
    : startDate.add(1, "month");

  if (startDate.isAfter(endDate)) {
    return program.error("Start date must be before end date");
  }

  await action(accountNumber, { ...opts, startDate, endDate });
}

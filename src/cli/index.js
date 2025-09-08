#!/usr/bin/env node
import { program } from "commander";
import { generateReport } from "./generate-report.js";
import ora from "ora";
import { initializeDB, closeDB } from "../infrastructure/db.js";
import { loadConfig } from "../infrastructure/config.js";

program
  .name("ditto")
  .description("A CLI tool for interacting with galileo transactions")
  .version("1.0.0")
  .hook("preAction", async () => {
    const spinner = ora("Initializing Ditto CLI...").start();
    await loadConfig();
    await initializeDB();
    spinner.succeed();
  })
  .hook("postAction", async () => {
    const spinner = ora("Shutting down Ditto CLI...").start();
    await closeDB();
    spinner.succeed();
  });

program
  .command("generate:report")
  .arguments("<accountNumber>", "The account number to generate the report for")
  .description("Generate a report of transactions")
  .option(
    "-u, --user <user>",
    "The user type to generate the report for (e.g., admin, user)",
    "user"
  )
  .option(
    "-o, --output <file>",
    "Output directory for the report",
    process.cwd()
  )
  .option(
    "-f, --format <type>",
    "Format of the report (e.g., csv, json, console)",
    "csv"
  )
  .action(generateReport);

program.parse();

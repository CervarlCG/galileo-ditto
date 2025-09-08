import fs from "fs/promises";
import { join } from "path";

export class CSVExporter {
  export = async ({ data, filename, outDir }) => {
    const headers = Object.keys(data[0] || {});
    const rows = data.map((row) =>
      headers.map((header) => this.scapeValue(row[header]) || '""').join(",")
    );
    await fs.writeFile(
      join(outDir, `${filename}.csv`),
      [headers.join(","), ...rows].join("\n")
    );
  };

  scapeValue(value) {
    if (typeof value !== "string") return String(value);
    if (/[",\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

import fs from "fs/promises";

export const config = {};

export async function loadConfig() {
  const data = await fs.readFile("/etc/ditto.json");
  const configLoaded = JSON.parse(data);
  Object.assign(config, configLoaded);
}

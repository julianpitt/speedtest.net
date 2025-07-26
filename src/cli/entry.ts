#!/usr/bin/env node

/**
 * CLI entry point for speedtest-net with complete option support
 */

import { Command } from "commander";
import { runSpeedtest } from "./commands.js";
import { getVersion } from "./utils.js";

export async function main(): Promise<void> {
  const program = new Command();
  const version = await getVersion();

  program
    .name("speedtest-net")
    .description("CLI speedtest.net client")
    .version(version)
    .option("--accept-license", "Accept the Ookla EULA, TOS and Privacy policy")
    .option("--accept-gdpr", "Accept the Ookla GDPR terms")
    .option(
      "-s, --server-id <id>",
      "Test using a specific server by Ookla server ID"
    )
    .option(
      "-i, --source-ip <ip>",
      "Test a specific network interface identified by local IP"
    )
    .option("-o, --host <host>", "Use a specific host")
    .option(
      "-v, --verbose",
      "Enable verbose output",
      (_, previous) => previous + 1,
      0
    )
    .option("-p, --progress", "Show progress during test")
    .option(
      "--non-interactive",
      "Display results only once without live updates"
    )
    .option("--json", "Output results in JSON format only");

  program.action(async (options) => {
    await runSpeedtest({
      acceptLicense: options.acceptLicense,
      acceptGdpr: options.acceptGdpr,
      serverId: options.serverId,
      sourceIp: options.sourceIp,
      host: options.host,
      verbosity: options.verbose,
      progress: options.progress,
      nonInteractive: options.nonInteractive,
      json: options.json,
    });
  });

  await program.parseAsync();
}

// Only run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

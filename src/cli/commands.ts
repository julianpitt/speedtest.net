/**
 * CLI command handlers
 */

import { exec } from "../index.js";
import { updateLiveDisplay, renderHeader, renderStatus } from "./display.js";
import { makeSpinner, speedText, centerText, c } from "./utils.js";
import { CLIOptions, SpeedTestProgress } from "./types.js";

export async function runSpeedtest(options: CLIOptions): Promise<void> {
  // Validate conflicting options
  if (options.json && options.nonInteractive) {
    console.warn("Warning: --json mode overrides --non-interactive mode");
  }

  // Handle JSON output mode
  if (options.json) {
    try {
      const result = await exec({
        acceptLicense: options.acceptLicense,
        acceptGdpr: options.acceptGdpr,
        serverId: options.serverId,
        sourceIp: options.sourceIp,
        host: options.host,
        verbosity: options.verbosity,
      });

      // Transform result to include units and structured data
      const resultAny = result as any; // Type assertion for additional properties

      const jsonOutput = {
        timestamp: new Date().toISOString(),
        ping: {
          latency: result.ping?.latency,
          latency_ms: result.ping?.latency,
          unit: "ms",
        },
        download: {
          bandwidth: result.download?.bandwidth,
          bandwidth_mbps: result.download?.bandwidth
            ? (result.download.bandwidth / 1000000).toFixed(2)
            : null,
          unit: "Mbps",
        },
        upload: {
          bandwidth: result.upload?.bandwidth,
          bandwidth_mbps: result.upload?.bandwidth
            ? (result.upload.bandwidth / 1000000).toFixed(2)
            : null,
          unit: "Mbps",
        },
        server: {
          id: result.server?.id,
          name: result.server?.name,
          location: result.server?.location,
          country: resultAny.server?.country,
          host: resultAny.server?.host,
          port: resultAny.server?.port,
          ip: resultAny.server?.ip,
        },
        client: {
          ip: resultAny.client?.ip,
          lat: resultAny.client?.lat,
          lon: resultAny.client?.lon,
          isp: resultAny.client?.isp || resultAny.isp,
          isprating: resultAny.client?.isprating,
          rating: resultAny.client?.rating,
          ispdlavg: resultAny.client?.ispdlavg,
          ispulavg: resultAny.client?.ispulavg,
          country: resultAny.client?.country,
        },
        result: {
          id: result.result?.id,
          url: result.result?.url,
          persisted: resultAny.result?.persisted,
        },
      };

      console.log(JSON.stringify(jsonOutput, null, 2));
      return;
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error(
        JSON.stringify(
          {
            error: errorMessage,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
      );
      process.exit(1);
    }
  }

  let updateInterval: NodeJS.Timeout | null = null;

  try {
    let step = "Ping";
    const statuses: Record<string, boolean | string> = {
      Ping: true,
      Download: false,
      Upload: false,
    };

    let serverInfo = "";
    let ispInfo = "";
    let resultInfo = "";

    function updateDisplay(): void {
      // Skip live updates in non-interactive mode
      if (options.nonInteractive) {
        return;
      }

      const spinner = makeSpinner();
      const headerTxt = renderHeader(statuses);
      const speedsTxt = renderStatus(statuses, step, spinner);

      updateLiveDisplay(headerTxt, speedsTxt, serverInfo, ispInfo, resultInfo);
    }

    // Only show initial display and start timer if interactive
    if (!options.nonInteractive) {
      updateDisplay();
      updateInterval = setInterval(updateDisplay, 100);
    } else {
      console.log("Running speedtest...");
    }

    const result = await exec({
      acceptLicense: options.acceptLicense,
      acceptGdpr: options.acceptGdpr,
      serverId: options.serverId,
      sourceIp: options.sourceIp,
      host: options.host,
      verbosity: options.verbosity,
      progress: (event: SpeedTestProgress) => {
        const content = event[event.type || ""] || {};

        // Update server and ISP info when available
        if (event.server && !serverInfo) {
          serverInfo = centerText(
            `Server: ${event.server.name} (${event.server.location})`,
            72
          );
        }
        if (event.isp && !ispInfo) {
          ispInfo = centerText(`ISP: ${event.isp}`, 72);
        }

        switch (event.type) {
          case "ping":
            step = "Ping";
            if (content.latency) {
              statuses.Ping = content.latency.toFixed(1) + " ms";
            }
            break;
          case "download":
            statuses.Download = speedText(content.bandwidth || 0);
            step = "Download";
            break;
          case "upload":
            statuses.Upload = speedText(content.bandwidth || 0);
            step = "Upload";
            break;
        }
      },
    });

    // Add result URL to the display
    if (result.result?.url) {
      resultInfo = centerText(`🔗 ${result.result.url}`, 72);
    }

    step = "Finished";
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }

    // Show final results
    if (options.nonInteractive) {
      // Non-interactive mode: show simple results
      console.log("\n" + "=".repeat(80));
      console.log("SPEEDTEST RESULTS");
      console.log("=".repeat(80));

      if (serverInfo) {
        const serverText = serverInfo.trim();
        console.log(serverText);
      }
      if (ispInfo) {
        const ispText = ispInfo.trim();
        console.log(ispText);
      }

      console.log("");
      console.log(`Ping:     ${statuses.Ping}`);
      console.log(`Download: ${statuses.Download}`);
      console.log(`Upload:   ${statuses.Upload}`);

      if (resultInfo) {
        console.log("");
        const urlText = resultInfo.trim();
        console.log(urlText);
      }
      console.log("=".repeat(80));
    } else {
      // Interactive mode: show final dashboard
      updateDisplay();
    }
  } catch (error) {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
    const errorMessage = (error as Error).message;

    // Filter out the "Invalid count value" error which seems to be from the underlying binary
    if (errorMessage.includes("Invalid count value")) {
      // Silently ignore this error as it seems to be a harmless cleanup issue
      return;
    }

    if (errorMessage.includes("acceptLicense")) {
      console.error(
        c(
          "red",
          errorMessage.replace("acceptLicense: true", "--accept-license")
        )
      );
    } else if (errorMessage.includes("acceptGdpr")) {
      console.error(
        c("red", errorMessage.replace("acceptGdpr: true", "--accept-gdpr"))
      );
    } else {
      console.error(c("red", errorMessage));
    }
    process.exit(1);
  } finally {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
  }
}

#!/usr/bin/env node

/**
 * CLI wrapper for speedtest-net - main entry point
 */

import { main } from "./cli/entry.js";

main().catch(console.error);

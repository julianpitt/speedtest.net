/**
 * CLI-specific type definitions
 */

export interface SpeedTestProgress {
  [key: string]: any;
  type?: string;
  ping?: { latency: number };
  download?: { bandwidth: number };
  upload?: { bandwidth: number };
  server?: { name: string; location: string };
  isp?: string;
}

export interface CLIOptions {
  acceptLicense?: boolean;
  acceptGdpr?: boolean;
  serverId?: string;
  sourceIp?: string;
  host?: string;
  verbosity?: number;
  progress?: boolean;
  nonInteractive?: boolean;
  json?: boolean;
}

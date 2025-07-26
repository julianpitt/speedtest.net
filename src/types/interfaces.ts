import { z } from "zod";

/**
 * Platform configuration for speedtest CLI binaries
 */
export interface Platform {
  platform: string;
  arch: string;
  pkg: string;
  bin: string;
  sha: string;
}

/**
 * Progress phases for speedtest execution
 */
export interface ProgressPhases {
  ping: number;
  download: number;
  upload: number;
}

/**
 * Progress data received during speedtest execution
 */
export interface ProgressData {
  type?: string;
  timestamp?: Date;
  progress?: number;
  ping?: {
    jitter: number;
    latency: number;
    low?: number;
    high?: number;
    progress?: number;
  };
  download?: {
    bandwidth: number;
    bytes: number;
    elapsed: number;
    progress?: number;
  };
  upload?: {
    bandwidth: number;
    bytes: number;
    elapsed: number;
    progress?: number;
  };
  result?: SpeedtestResult;
  error?: string;
  level?: string;
  message?: string;
}

/**
 * Server information
 */
export interface Server {
  id: number;
  host: string;
  port: number;
  name: string;
  location: string;
  country: string;
  cc: string;
  sponsor: string;
  distance: number;
}

/**
 * Interface information
 */
export interface Interface {
  internalIp: string;
  name: string;
  macAddr: string;
  isVpn: boolean;
  externalIp: string;
}

/**
 * Speedtest result structure
 */
export interface SpeedtestResult {
  type: "result";
  timestamp: Date;
  ping: {
    jitter: number;
    latency: number;
    low: number;
    high: number;
  };
  download: {
    bandwidth: number;
    bytes: number;
    elapsed: number;
  };
  upload: {
    bandwidth: number;
    bytes: number;
    elapsed: number;
  };
  packetLoss?: number;
  isp: string;
  interface: Interface;
  server: Server;
  result: {
    id: string;
    url: string;
    persisted: boolean;
  };
}

/**
 * Options for speedtest execution
 */
export interface SpeedtestOptions {
  /** Accept license automatically */
  acceptLicense?: boolean;
  /** Accept GDPR automatically */
  acceptGdpr?: boolean;
  /** Progress callback function */
  progress?: (data: ProgressData) => void;
  /** Specific server ID to use */
  serverId?: string;
  /** Source IP address to bind to */
  sourceIp?: string;
  /** Host to connect to */
  host?: string;
  /** Cancel function */
  cancel?: CancelFunction;
  /** Path to custom binary */
  binary?: string;
  /** Binary version to use */
  binaryVersion?: string;
  /** Verbosity level (0-3) */
  verbosity?: number;
}

/**
 * Binary configuration options
 */
export interface BinaryOptions {
  platform?: string;
  arch?: string;
  binaryVersion?: string;
}

/**
 * Cancel function type
 */
export type CancelFunction = (
  setHandler?: symbol,
  handler?: () => void
) => boolean | void;

/**
 * Cancel handler function type
 */
export type CancelHandler = () => void;

/**
 * Zod schemas for validation
 */
export const SpeedtestOptionsSchema = z.object({
  acceptLicense: z.boolean().optional(),
  acceptGdpr: z.boolean().optional(),
  progress: z.function().optional(),
  serverId: z.string().optional(),
  sourceIp: z.string().optional(),
  host: z.string().optional(),
  binary: z.string().optional(),
  binaryVersion: z.string().optional(),
  verbosity: z.number().min(0).max(3).optional(),
});

export const BinaryOptionsSchema = z.object({
  platform: z.string().optional(),
  arch: z.string().optional(),
  binaryVersion: z.string().optional(),
});

/**
 * Type guards
 */
export const isSpeedtestResult = (data: any): data is SpeedtestResult => {
  return data && typeof data === "object" && data.type === "result";
};

export const isProgressData = (data: any): data is ProgressData => {
  return data && typeof data === "object";
};

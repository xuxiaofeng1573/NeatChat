// JSON-RPC 2.0 message types used by the Model Context Protocol.
// ref: https://spec.modelcontextprotocol.io/specification/basic/messages/

import { z } from "zod";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

export type McpRequestId = string | number;

type JsonRpcParams = Record<string, unknown>;
type JsonRpcResult = Record<string, unknown>;

/** A JSON-RPC request. Notifications are represented by McpNotifications. */
export interface McpRequestMessage {
  jsonrpc: "2.0";
  id: McpRequestId;
  method: string;
  params?: JsonRpcParams;
}

export const McpRequestMessageSchema: z.ZodType<McpRequestMessage> = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.string(), z.number()]),
  method: z.string().min(1),
  params: z.record(z.string(), z.unknown()).optional(),
});

export interface McpResponseMessage {
  jsonrpc: "2.0";
  id: McpRequestId;
  result?: JsonRpcResult;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

// A response must contain exactly one of result and error.
export const McpResponseMessageSchema: z.ZodType<McpResponseMessage> = z
  .object({
    jsonrpc: z.literal("2.0"),
    id: z.union([z.string(), z.number()]),
    result: z.record(z.string(), z.unknown()).optional(),
    error: z
      .object({
        code: z.number().int(),
        message: z.string(),
        data: z.unknown().optional(),
      })
      .optional(),
  })
  .refine(({ result, error }) => (result === undefined) !== (error === undefined), {
    message: "A JSON-RPC response must contain exactly one of result or error",
  });

export interface McpNotifications {
  jsonrpc: "2.0";
  method: string;
  params?: JsonRpcParams;
}

export const McpNotificationsSchema: z.ZodType<McpNotifications> = z.object({
  jsonrpc: z.literal("2.0"),
  method: z.string().min(1),
  params: z.record(z.string(), z.unknown()).optional(),
});

////////////
// Next Chat
////////////

export interface McpTool {
  name: string;
  description?: string;
  inputSchema: object;
  [key: string]: unknown;
}

export interface ListToolsResponse {
  // MCP tools/list returns an array, not a single tool object.
  tools: McpTool[];
  [key: string]: unknown;
}

export type McpClientData =
  | McpActiveClient
  | McpErrorClient
  | McpInitializingClient;

export interface McpInitializingClient {
  client: null;
  tools: null;
  errorMsg: null;
}

export interface McpActiveClient {
  client: Client;
  tools: ListToolsResponse;
  errorMsg: null;
}

export interface McpErrorClient {
  client: null;
  tools: null;
  errorMsg: string;
}

// 服务器状态类型
export type ServerStatus =
  | "undefined"
  | "active"
  | "paused"
  | "error"
  | "initializing";

export interface ServerStatusResponse {
  status: ServerStatus;
  errorMsg: string | null;
}

// MCP 服务器配置相关类型
export interface ServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
  status?: "active" | "paused" | "error";
}

export interface McpConfigData {
  // MCP Server 的配置
  mcpServers: Record<string, ServerConfig>;
}

export const DEFAULT_MCP_CONFIG: McpConfigData = {
  mcpServers: {},
};

export interface ArgsMapping {
  // 参数映射的类型
  type: "spread" | "single" | "env";

  // 参数映射的位置
  position?: number;

  // 参数映射的 key
  key?: string;
}

export interface PresetServer {
  // MCP Server 的唯一标识，作为最终配置文件 Json 的 key
  id: string;

  // MCP Server 的显示名称
  name: string;

  // MCP Server 的描述
  description: string;

  // MCP Server 的仓库地址
  repo: string;

  // MCP Server 的标签
  tags: string[];

  // MCP Server 的命令
  command: string;

  // MCP Server 的参数
  baseArgs: string[];

  // MCP Server 是否需要配置
  configurable: boolean;

  // MCP Server 的配置 schema
  configSchema?: {
    properties: Record<
      string,
      {
        type: string;
        description?: string;
        required?: boolean;
        minItems?: number;
      }
    >;
  };

  // MCP Server 的参数映射
  argsMapping?: Record<string, ArgsMapping>;
}

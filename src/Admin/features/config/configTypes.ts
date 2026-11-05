export interface IApiKeySummary {
  apiKeyId: string;
  keyId: string;
  apiKeyEnabled: boolean;
}

export interface IClientRecord {
  clientId: string;
  clientName: string;
  clientUrl: string;
  clientEnabled: boolean;
  keys: IApiKeySummary[];
}

export interface PaginatedClientsResponse {
  info: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
  };
  data: IClientRecord[];
}

export interface CreateClientPayload {
  name: string;
  url: string;
}

export interface CreateClientResult {
  name: string;
  apiKey: string;
}

export interface UpdateClientPayload {
  name?: string;
  url?: string;
  enabled?: boolean;
}

// System Logs Types
export type LogLevel = 'FATAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';

export interface ILogger {
  id: string;
  levelName: LogLevel | string;
  levelCode: number;
  message: string;
  type?: string | null;
  status?: number | null;
  stack?: string | null;
  contexts?: string[];
  pid: number;
  time: number;
  hostname: string;
  keep: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ILogPagesInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedLogsResponse {
  info: ILogPagesInfo;
  data: ILogger[];
}

export interface LogFilterParams {
  searchField?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export type ConfigSubTab = 'clients' | 'apikeys' | 'logs' | 'letters';

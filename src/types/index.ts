export interface Header {
  key: string;
  value: string;
}

export interface RequestConfig {
  method: string;
  url: string;
  headers: Header[];
  body: string;
}

export interface ResponseData {
  status?: number;
  statusText?: string;
  headers?: Record<string, string | string[]>;
  data?: unknown;
  time?: string;
  error?: boolean;
  message?: string;
}

export interface HistoryItem {
  method: string;
  url: string;
  time: string;
}
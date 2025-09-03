// TypeScript types for Stage 1 - Call Data Processing
// Based on the existing JavaScript implementation in ana/stages/1_get_ids/get_call_ids.js

export interface Net2PhoneTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface Net2PhoneCallEntry {
  from: {
    call_id: string;
    value: string;
    username: string;
    name: string;
    recordings?: Array<{
      url: string;
    }>;
  };
  to: {
    value: string;
    user?: string;
  };
  by?: {
    username: string;
  };
  start_time: string;
  duration: number;
}

export interface Net2PhoneApiResponse {
  result: Net2PhoneCallEntry[];
  count: number;
  next?: string;
  previous?: string;
}

export interface ProcessedCallData {
  call_id: string;
  from_number: string;
  to_number: string;
  from_username: string;
  from_name: string;
  start_time: string;
  duration: number;
  recording_url: string;
  broker_id: string;
  date: string;
}

export interface DateRange {
  start_date: string;
  end_date: string;
}

export interface CallIdFetchRequest {
  start_date: string;
  end_date: string;
  page_size?: number;
  min_duration?: number;
}

export interface CallIdFetchResponse {
  success: boolean;
  total_calls: number;
  processed_calls: number;
  calls: ProcessedCallData[];
  date_range: DateRange;
  errors?: string[];
}

export interface Net2PhoneConfig {
  base_url: string;
  token_endpoint: string;
  calls_endpoint: string;
  page_size: number;
  min_duration: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

// Environment variables type
export interface EnvironmentConfig {
  NET2PHONE_CLIENT_ID: string;
  NET2PHONE_CLIENT_SECRET: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
}

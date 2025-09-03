import axios, { AxiosResponse } from 'axios';
import {
  Net2PhoneTokenResponse,
  Net2PhoneApiResponse,
  Net2PhoneConfig,
  CallIdFetchRequest,
  ProcessedCallData,
  ApiError
} from '@/lib/types/call-data';

export class Net2PhoneApiService {
  private config: Net2PhoneConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.config = {
      base_url: 'https://integrate.versature.com/api',
      token_endpoint: '/oauth/token/',
      calls_endpoint: '/cdrs/users/',
      page_size: 1000,
      min_duration: 15
    };
  }

  /**
   * Get OAuth2 access token from Net2Phone
   */
  async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', process.env.NET2PHONE_CLIENT_ID!);
      params.append('client_secret', process.env.NET2PHONE_CLIENT_SECRET!);

      const response: AxiosResponse<Net2PhoneTokenResponse> = await axios.post(
        this.config.base_url + this.config.token_endpoint,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 30000
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry time (subtract 60 seconds for safety)
      this.tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw new Error(`Failed to get access token: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Fetch call logs for a specific date
   */
  async getCallLogs(date: Date): Promise<Net2PhoneApiResponse> {
    try {
      const token = await this.getAccessToken();
      const endDate = new Date(date);
      endDate.setUTCDate(endDate.getUTCDate() + 1);

      const params: CallIdFetchRequest = {
        start_date: date.toISOString(),
        end_date: endDate.toISOString(),
        page_size: this.config.page_size,
        min_duration: this.config.min_duration
      };

      console.log('🔍 API Request Details:');
      console.log('  URL:', this.config.base_url + this.config.calls_endpoint);
      console.log('  Params:', JSON.stringify(params, null, 2));

      const response: AxiosResponse<Net2PhoneApiResponse> = await axios.get(
        this.config.base_url + this.config.calls_endpoint,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.integrate.v1.10.0+json',
            'Content-Type': 'application/json; charset=utf-8'
          },
          params,
          timeout: 60000
        }
      );

      console.log('📊 API Response:');
      console.log('  Status:', response.status);
      console.log('  Results count:', response.data.result?.length || 0);
      console.log('  Total count:', response.data.count || 0);

      return response.data;
    } catch (error) {
      console.error('❌ API Error Details:', error);
      throw new Error(`Failed to fetch call logs: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Process raw call data from Net2Phone API
   */
  processCallData(calls: Net2PhoneApiResponse['result']): ProcessedCallData[] {
    return calls.map(entry => {
      const from = entry.from || {};
      const to = entry.to || {};
      const recording = from.recordings?.[0]?.url || '';

      // Extract broker ID using the same logic as the original JavaScript
      let brokerId = '';
      if (to.user) {
        brokerId = to.user;
      } else if (to.value && to.value.includes('sip:') && to.value.includes('@')) {
        const match = to.value.match(/sip:(\d+)@/);
        if (match) {
          brokerId = match[1];
        }
      } else if (from.username && from.username.includes('@')) {
        const match = from.username.match(/(\d+)@/);
        if (match) {
          brokerId = match[1];
        }
      } else if (entry.by && entry.by.username && entry.by.username.includes('@')) {
        const match = entry.by.username.match(/(\d+)@/);
        if (match) {
          brokerId = match[1];
        }
      }

      return {
        call_id: from.call_id || '',
        from_number: from.value || '',
        to_number: to.value || '',
        from_username: from.username || '',
        from_name: from.name || '',
        start_time: entry.start_time || '',
        duration: entry.duration || 0,
        recording_url: recording,
        broker_id: brokerId,
        date: entry.start_time ? entry.start_time.split('T')[0] : ''
      };
    });
  }

  /**
   * Deduplicate calls by call_id, preferring entries with names and recordings
   */
  deduplicateCalls(calls: ProcessedCallData[]): ProcessedCallData[] {
    const callMap = new Map<string, ProcessedCallData>();

    for (const call of calls) {
      const key = call.call_id;
      const hasNameAndRecording = call.from_name?.trim() && call.recording_url?.trim();

      if (!callMap.has(key)) {
        callMap.set(key, call);
      } else if (hasNameAndRecording) {
        callMap.set(key, call);
      }
    }

    return Array.from(callMap.values());
  }

  /**
   * Get date range array
   */
  getDateRange(startDate: string, endDate: string): Date[] {
    const dates: Date[] = [];
    let current = new Date(startDate);
    const end = new Date(endDate);

    while (current < end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * Utility method to extract error message
   */
  private getErrorMessage(error: any): string {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Unknown error occurred';
  }
}

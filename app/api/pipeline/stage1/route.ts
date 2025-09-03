import { NextRequest, NextResponse } from 'next/server';
import { Net2PhoneApiService } from '@/lib/services/net2phone-api';
import { CallIdFetchResponse, DateRange, ApiError } from '@/lib/types/call-data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { start_date, end_date } = body;

    // Validate input
    if (!start_date || !end_date) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'start_date and end_date are required' 
        } as ApiError,
        { status: 400 }
      );
    }

    // Validate date format
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid date format. Use YYYY-MM-DD format' 
        } as ApiError,
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'start_date must be before end_date' 
        } as ApiError,
        { status: 400 }
      );
    }

    console.log('🚀 Starting Stage 1: Get Call IDs');
    console.log(`📅 Date range: ${start_date} to ${end_date}`);

    const net2phoneService = new Net2PhoneApiService();
    const dateRange: DateRange = { start_date, end_date };
    
    // Get date range array
    const dates = net2phoneService.getDateRange(start_date, end_date);
    console.log(`📊 Processing ${dates.length} days`);

    let totalCalls = 0;
    const allCalls: any[] = [];
    const errors: string[] = [];

    // Process each date
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const dateStr = date.toISOString().split('T')[0];

      try {
        console.log(`📅 Processing date: ${dateStr} (${i + 1}/${dates.length})`);
        
        // Fetch call logs for this date
        const callData = await net2phoneService.getCallLogs(date);
        const calls = net2phoneService.processCallData(callData.result || []);
        const dedupedCalls = net2phoneService.deduplicateCalls(calls);

        if (dedupedCalls.length > 0) {
          totalCalls += dedupedCalls.length;
          allCalls.push(...dedupedCalls);
          console.log(`✅ ${dateStr}: ${dedupedCalls.length} calls found`);
        } else {
          console.log(`ℹ️ ${dateStr}: No calls found`);
        }

        // Rate limiting - pause every 15 requests (same as original)
        if ((i + 1) % 15 === 0 && i < dates.length - 1) {
          console.log('⏸️ Rate limiting pause: 60 seconds...');
          await new Promise(resolve => setTimeout(resolve, 60000));
        } else {
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        const errorMessage = `Failed to process ${dateStr}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ ${errorMessage}`);
        errors.push(errorMessage);
      }
    }

    const response: CallIdFetchResponse = {
      success: true,
      total_calls: totalCalls,
      processed_calls: allCalls.length,
      calls: allCalls,
      date_range: dateRange,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('✅ Stage 1 completed successfully');
    console.log(`📊 Total calls found: ${totalCalls}`);
    console.log(`📊 Processed calls: ${allCalls.length}`);
    if (errors.length > 0) {
      console.log(`⚠️ Errors encountered: ${errors.length}`);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Stage 1 failed:', error);
    
    const errorResponse: ApiError = {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'STAGE1_ERROR'
    };

    return NextResponse.json(
      { success: false, ...errorResponse },
      { status: 500 }
    );
  }
}

// Handle GET requests for status check
export async function GET() {
  return NextResponse.json({
    message: 'Stage 1 API endpoint is running',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}

# Stage 1: Get Call IDs - Modern Implementation

This is a modernized version of Stage 1 from the ANA pipeline, built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Type Safety**: Full TypeScript implementation with proper type definitions
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- **Real-time Progress**: Live updates during data fetching
- **Error Handling**: Comprehensive error handling and user feedback
- **Data Export**: JSON export functionality
- **Rate Limiting**: Built-in API rate limiting to respect Net2Phone limits

## 📁 File Structure

```
revamp2-analysis/
├── app/
│   ├── api/pipeline/stage1/route.ts    # API endpoint
│   ├── layout.tsx                      # App layout
│   └── page.tsx                        # Main page
├── components/
│   └── pipeline/
│       └── stage1-get-calls.tsx        # React component
├── lib/
│   ├── types/
│   │   └── call-data.ts                # TypeScript types
│   └── services/
│       └── net2phone-api.ts            # Net2Phone API service
└── .env                                # Environment variables
```

## 🔧 Setup

1. **Install Dependencies**:
   ```bash
   npm install axios @types/xlsx dotenv
   ```

2. **Environment Variables**:
   Make sure your `.env` file contains:
   ```env
   NET2PHONE_CLIENT_ID=your_client_id
   NET2PHONE_CLIENT_SECRET=your_client_secret
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   Open [http://localhost:3000](http://localhost:3000)

## 🎯 How It Works

### 1. **User Interface**
- Date range picker for selecting start and end dates
- Real-time progress tracking
- Results display with call data preview
- Export functionality for JSON data

### 2. **API Integration**
- OAuth2 authentication with Net2Phone
- Automatic token refresh
- Rate limiting (1 second between requests, 60 seconds every 15 requests)
- Error handling and retry logic

### 3. **Data Processing**
- Fetches call logs for each date in the range
- Processes and deduplicates call data
- Extracts broker IDs using the same logic as the original
- Filters calls with recordings

### 4. **Type Safety**
- Comprehensive TypeScript interfaces
- Proper error handling with typed responses
- Type-safe API calls and data processing

## 📊 Data Structure

The implementation follows the exact same data structure as the original JavaScript version:

```typescript
interface ProcessedCallData {
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
```

## 🔄 API Endpoints

### POST `/api/pipeline/stage1`
Fetches call IDs from Net2Phone API.

**Request Body**:
```json
{
  "start_date": "2025-01-01",
  "end_date": "2025-01-07"
}
```

**Response**:
```json
{
  "success": true,
  "total_calls": 150,
  "processed_calls": 150,
  "calls": [...],
  "date_range": {
    "start_date": "2025-01-01",
    "end_date": "2025-01-07"
  }
}
```

## 🎨 UI Components

- **Date Range Picker**: Select start and end dates
- **Progress Indicator**: Real-time loading state
- **Results Summary**: Total calls, processed calls, recordings count
- **Data Table**: Preview of call data with sorting
- **Export Button**: Download data as JSON
- **Error Handling**: Clear error messages and retry options

## 🚀 Next Steps

This Stage 1 implementation provides a solid foundation for the remaining stages:

1. **Stage 2**: Download audio recordings
2. **Stage 3**: Transcribe audio with AssemblyAI
3. **Stage 4**: Upload to Supabase storage
4. **Stage 5**: Analyze calls with OpenAI

## 🔧 Development

- **Hot Reload**: Changes are reflected immediately
- **Type Checking**: TypeScript catches errors at compile time
- **Linting**: ESLint ensures code quality
- **Responsive Design**: Works on all screen sizes

## 📝 Notes

- Maintains 100% compatibility with the original JavaScript implementation
- Uses the same Net2Phone API endpoints and authentication
- Preserves all data processing logic and business rules
- Adds modern error handling and user experience improvements

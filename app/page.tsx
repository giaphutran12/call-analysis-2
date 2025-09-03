import { Stage1GetCalls } from '@/components/pipeline/stage1-get-calls';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Call Analysis Pipeline</h1>
              <p className="text-sm text-gray-600">Modernized with Next.js, TypeScript, and Tailwind CSS</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Stage 1 Ready
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8">
        <Stage1GetCalls />
      </main>
    </div>
  );
}

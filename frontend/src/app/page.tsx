import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Nexus
          </h1>
          <p className="text-2xl text-gray-700 mb-2">
            Collaborative Legal & Policy Research Hub
          </p>
          <p className="text-xl text-gray-600">
            ศูนย์กลางงานวิจัยกฎหมายและนโยบายร่วม
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            🚀 Key Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                🔍 Multi-Faceted Search
              </h3>
              <p className="text-gray-700">
                Search millions of legal documents, regulations, and case law with full Thai and English language support.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                🕸️ Knowledge Graph
              </h3>
              <p className="text-gray-700">
                Visualize relationships between documents, citations, amendments, and references.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                📊 Trend Analysis
              </h3>
              <p className="text-gray-700">
                Track regulatory trends and policy developments over time with powerful analytics.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                📝 Collaborative Annotations
              </h3>
              <p className="text-gray-700">
                Add private notes and create custom document connections for your research.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/search"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg transition-colors mr-4"
          >
            Start Searching
          </Link>
          <Link
            href="/login"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg transition-colors"
          >
            Login
          </Link>
        </div>

        <div className="mt-16 text-center text-gray-600">
          <p className="mb-2">
            <strong>Role-Based Access:</strong>
          </p>
          <div className="flex justify-center gap-8 flex-wrap">
            <div>
              <span className="inline-block bg-gray-200 px-4 py-2 rounded">
                👤 Guest - Search & View
              </span>
            </div>
            <div>
              <span className="inline-block bg-blue-200 px-4 py-2 rounded">
                🔬 Researcher - Annotate & Link
              </span>
            </div>
            <div>
              <span className="inline-block bg-purple-200 px-4 py-2 rounded">
                👑 Admin - Full Access
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

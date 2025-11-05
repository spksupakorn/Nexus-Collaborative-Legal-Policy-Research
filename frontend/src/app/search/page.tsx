'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

interface SearchResult {
  id: string;
  documentId: string;
  titleEn: string;
  titleTh: string;
  summaryEn?: string;
  summaryTh?: string;
  documentType: string;
  publicationDate?: string;
  highlights?: Record<string, string[]>;
  score: number;
}

export default function SearchPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, logout, _hasHydrated } = useAuthStore();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchType, setSearchType] = useState<'text' | 'semantic'>('text');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Redirect to login if not authenticated (after hydration)
  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        'http://localhost:3001/api/v1/search',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query,
            language: 'both',
            page: 1,
            limit: 20,
            filters: selectedTypes.length > 0 ? {
              documentType: selectedTypes
            } : undefined
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred during search');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Show loading while hydrating
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
              Nexus
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/search" className="text-blue-600 font-medium">
                ค้นหา / Search
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                แดชบอร์ด / Dashboard
              </Link>
              <div className="border-l pl-4 flex items-center gap-4">
                <span className="text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                >
                  ออกจากระบบ / Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                ค้นหาเอกสาร / Search Documents
              </label>
              <div className="flex gap-2">
                <input
                  id="search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="พิมพ์คำค้นหา... / Enter search query..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'กำลังค้นหา...' : 'ค้นหา / Search'}
                </button>
              </div>
            </div>

            {/* Search Options */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search Type */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  ประเภทการค้นหา / Search Type:
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as 'text' | 'semantic')}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="text">ข้อความ / Text</option>
                  <option value="semantic">ความหมาย / Semantic</option>
                </select>
              </div>

              {/* Document Type Filters */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  ประเภทเอกสาร / Document Type:
                </label>
                <div className="flex gap-2">
                  {['law', 'policy', 'regulation', 'research'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeToggle(type)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        selectedTypes.includes(type)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Search Results */}
        <div className="space-y-4">
          {results.length > 0 && (
            <div className="text-sm text-gray-600 mb-4">
              พบ {results.length} ผลลัพธ์ / Found {results.length} results
            </div>
          )}

          {results.map((result) => {
            // Detect which language had matches based on highlights
            const hasThaiHighlight = result.highlights?.['title_th'] || result.highlights?.['content_th'] || result.highlights?.['summary_th'];
            const hasEnglishHighlight = result.highlights?.['title_en'] || result.highlights?.['content_en'] || result.highlights?.['summary_en'];
            
            // Show title in the language that matched, prefer English if both matched
            const displayTitle = hasEnglishHighlight && !hasThaiHighlight 
              ? result.titleEn || result.titleTh
              : result.titleTh || result.titleEn;
              
            const displaySummary = hasEnglishHighlight && !hasThaiHighlight
              ? result.summaryEn || result.summaryTh
              : result.summaryTh || result.summaryEn;
            
            return (
              <div key={result.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {displayTitle}
                  </h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {result.documentType}
                  </span>
                </div>
                
                {displaySummary && (
                  <p className="text-gray-600 mb-3">
                    {displaySummary}
                  </p>
                )}
                
                {result.highlights && (
                  <div className="text-gray-700 mb-3">
                    {/* Show English highlights if English matched, otherwise Thai */}
                    {hasEnglishHighlight && !hasThaiHighlight && result.highlights['content_en'] && (
                      <p className="line-clamp-2" dangerouslySetInnerHTML={{ __html: result.highlights['content_en'][0] }} />
                    )}
                    {(hasThaiHighlight || !hasEnglishHighlight) && result.highlights['content_th'] && (
                      <p className="line-clamp-2" dangerouslySetInnerHTML={{ __html: result.highlights['content_th'][0] }} />
                    )}
                    {/* Fallback to English if no Thai highlight */}
                    {!result.highlights['content_th'] && result.highlights['content_en'] && (
                      <p className="line-clamp-2" dangerouslySetInnerHTML={{ __html: result.highlights['content_en'][0] }} />
                    )}
                  </div>
                )}

                {result.publicationDate && (
                  <p className="text-sm text-gray-500 mb-3">
                    📅 {new Date(result.publicationDate).toLocaleDateString('th-TH')}
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    คะแนนความเกี่ยวข้อง / Relevance: {(result.score * 100).toFixed(1)}%
                  </span>
                  <Link
                    href={`/documents/${result.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ดูรายละเอียด / View Details →
                  </Link>
                </div>
              </div>
            );
          })}

          {!isLoading && results.length === 0 && query && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">ไม่พบผลลัพธ์ / No results found</p>
              <p className="text-sm mt-2">ลองค้นหาด้วยคำอื่น / Try a different search term</p>
            </div>
          )}

          {!query && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">เริ่มค้นหาเอกสาร / Start searching for documents</p>
              <p className="text-sm mt-2">
                ใช้แถบค้นหาด้านบนเพื่อค้นหากฎหมาย นโยบาย และเอกสารวิจัย
              </p>
              <p className="text-sm">
                Use the search bar above to find laws, policies, and research documents
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

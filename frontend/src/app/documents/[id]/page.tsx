'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

interface Document {
  id: string;
  titleEn: string;
  titleTh: string;
  summaryEn?: string;
  summaryTh?: string;
  contentEn?: string;
  contentTh?: string;
  documentType: string;
  jurisdiction?: string;
  sourceUrl?: string;
  publicationDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token, isAuthenticated, logout, _hasHydrated } = useAuthStore();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState<'en' | 'th'>('th');

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && params.id) {
      fetchDocument();
    }
  }, [_hasHydrated, isAuthenticated, params.id]);

  const fetchDocument = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `http://localhost:3001/api/v1/documents/${params.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }

      const data = await response.json();
      setDocument(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
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
    return null;
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
            <nav className="flex items-center space-x-6">
              <Link href="/search" className="text-gray-600 hover:text-blue-600">
                ค้นหา / Search
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
                แดชบอร์ด / Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600"
              >
                ออกจากระบบ / Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← กลับ / Back
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-600">กำลังโหลด / Loading...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {document && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Language Toggle */}
            <div className="flex justify-end mb-6">
              <div className="inline-flex rounded-lg border border-gray-200">
                <button
                  onClick={() => setLanguage('th')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    language === 'th'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ไทย
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                    language === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Document Type Badge */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {document.documentType}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {language === 'th' ? document.titleTh : document.titleEn}
            </h1>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b">
              {document.jurisdiction && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    เขตอำนาจศาล / Jurisdiction:
                  </span>
                  <p className="text-gray-900">{document.jurisdiction}</p>
                </div>
              )}
              {document.publicationDate && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    วันที่เผยแพร่ / Publication Date:
                  </span>
                  <p className="text-gray-900">
                    {new Date(document.publicationDate).toLocaleDateString('th-TH')}
                  </p>
                </div>
              )}
            </div>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  แท็ก / Tags:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {(language === 'th' ? document.summaryTh : document.summaryEn) && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {language === 'th' ? 'สรุป' : 'Summary'}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {language === 'th' ? document.summaryTh : document.summaryEn}
                </p>
              </div>
            )}

            {/* Content */}
            {(language === 'th' ? document.contentTh : document.contentEn) && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {language === 'th' ? 'เนื้อหา' : 'Content'}
                </h2>
                <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                  {language === 'th' ? document.contentTh : document.contentEn}
                </div>
              </div>
            )}

            {/* Source URL */}
            {document.sourceUrl && (
              <div className="mt-8 pt-6 border-t">
                <a
                  href={document.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  🔗 แหล่งที่มา / Source
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            )}

            {/* Timestamps */}
            <div className="mt-8 pt-6 border-t text-sm text-gray-500">
              <p>
                สร้างเมื่อ / Created: {new Date(document.createdAt).toLocaleString('th-TH')}
              </p>
              <p>
                อัปเดตเมื่อ / Updated: {new Date(document.updatedAt).toLocaleString('th-TH')}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

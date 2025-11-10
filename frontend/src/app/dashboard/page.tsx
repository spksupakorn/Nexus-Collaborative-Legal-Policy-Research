'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/authStore';
import TrendAnalysis from '@/components/TrendAnalysis';

// Dynamic import to avoid SSR issues with ReactFlow
const KnowledgeGraph = dynamic(
  () => import('@/components/KnowledgeGraph'),
  { ssr: false }
);

interface DashboardStats {
  totalDocuments: number;
  totalUsers: number;
  totalSearches: number;
  recentDocuments: Array<{
    id: string;
    title: string;
    type: string;
    createdAt: string;
  }>;
  documentTrends: Array<{ date: string; count: number }>;
  searchTrends: Array<{ date: string; count: number }>;
  categoryDistribution: Array<{ name: string; value: number; color: string }>;
  popularTags: Array<{ tag: string; count: number }>;
  knowledgeGraph: {
    nodes: Array<{ id: string; title: string; type: string; tags?: string[] }>;
    links: Array<{ sourceId: string; targetId: string; type: string }>;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, logout, _hasHydrated } = useAuthStore();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'trends'>('overview');

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, router, token]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/v1/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      
      // Add safe defaults for missing fields
      setStats({
        totalDocuments: data.totalDocuments || 0,
        totalUsers: data.totalUsers || 0,
        totalSearches: data.totalSearches || 0,
        recentDocuments: data.recentDocuments || [],
        documentTrends: data.documentTrends || [],
        searchTrends: data.searchTrends || [],
        categoryDistribution: data.categoryDistribution || [],
        popularTags: data.popularTags || [],
        knowledgeGraph: data.knowledgeGraph || { nodes: [], links: [] }
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      // Set mock data for demo purposes
      setStats(getMockData());
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
            <nav className="flex items-center gap-4">
              <Link href="/search" className="text-gray-700 hover:text-blue-600">
                ค้นหา / Search
              </Link>
              <Link href="/dashboard" className="text-blue-600 font-medium">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            แดชบอร์ด / Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            ภาพรวมและการวิเคราะห์ข้อมูล / Overview and Analytics
          </p>
        </div>

        {error && !stats && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-4">
            {error} - แสดงข้อมูลตัวอย่าง / Showing demo data
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">เอกสารทั้งหมด / Total Documents</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDocuments}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">ผู้ใช้งาน / Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">การค้นหา / Total Searches</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSearches}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    ภาพรวม / Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('graph')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'graph'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    กราฟความรู้ / Knowledge Graph
                  </button>
                  <button
                    onClick={() => setActiveTab('trends')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'trends'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    การวิเคราะห์แนวโน้ม / Trend Analysis
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Recent Documents */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold mb-4">
                    เอกสารล่าสุด / Recent Documents
                  </h3>
                  <div className="space-y-3">
                    {stats.recentDocuments?.length > 0 ? (
                      stats.recentDocuments.map((doc) => (
                        <div key={doc.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{doc.title || 'Untitled'}</h4>
                            <p className="text-sm text-gray-500">
                              {doc.type || 'Unknown'} • {new Date(doc.createdAt).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                          <Link
                            href={`/documents/${doc.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            ดู / View →
                          </Link>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">ไม่มีเอกสาร / No documents available</p>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-4">
                      การกระจายตามประเภท / Category Distribution
                    </h3>
                    <div className="space-y-3">
                      {stats.categoryDistribution?.length > 0 ? (
                        stats.categoryDistribution.map((cat, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ background: cat.color }}
                              />
                              <span className="text-sm">{cat.name}</span>
                            </div>
                            <span className="font-semibold">{cat.value}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">ไม่มีข้อมูลประเภท / No category data</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-4">
                      แท็กยอดนิยม / Popular Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {stats.popularTags?.length > 0 ? (
                        stats.popularTags.slice(0, 10).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                          >
                            {tag.tag} ({tag.count})
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">ไม่มีข้อมูลแท็ก / No tags available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'graph' && (
              <div className="bg-white rounded-lg shadow-md" style={{ height: '600px' }}>
                <KnowledgeGraph data={stats.knowledgeGraph} />
              </div>
            )}

            {activeTab === 'trends' && (
              <TrendAnalysis
                documentTrends={stats.documentTrends}
                searchTrends={stats.searchTrends}
                categoryDistribution={stats.categoryDistribution}
                popularTags={stats.popularTags}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>ไม่สามารถโหลดข้อมูลได้ / Unable to load data</p>
          </div>
        )}
      </main>
    </div>
  );
}

// Mock data for demonstration
function getMockData(): DashboardStats {
  return {
    totalDocuments: 156,
    totalUsers: 23,
    totalSearches: 1847,
    recentDocuments: [
      {
        id: '1',
        title: 'พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562',
        type: 'law',
        createdAt: '2025-11-01T10:00:00Z',
      },
      {
        id: '2',
        title: 'นโยบายความมั่นคงปลอดภัยไซเบอร์แห่งชาติ',
        type: 'policy',
        createdAt: '2025-10-28T14:30:00Z',
      },
      {
        id: '3',
        title: 'ระเบียบสำนักนายกรัฐมนตรีว่าด้วยการรักษาความมั่นคงปลอดภัยของเทคโนโลยีสารสนเทศ',
        type: 'regulation',
        createdAt: '2025-10-25T09:15:00Z',
      },
      {
        id: '4',
        title: 'งานวิจัย: ผลกระทบของกฎหมายคุ้มครองข้อมูลส่วนบุคคลต่อธุรกิจไทย',
        type: 'research',
        createdAt: '2025-10-20T16:45:00Z',
      },
      {
        id: '5',
        title: 'พระราชบัญญัติว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์',
        type: 'law',
        createdAt: '2025-10-15T11:20:00Z',
      },
    ],
    documentTrends: [
      { date: 'ม.ค./Jan', count: 12 },
      { date: 'ก.พ./Feb', count: 19 },
      { date: 'มี.ค./Mar', count: 15 },
      { date: 'เม.ย./Apr', count: 22 },
      { date: 'พ.ค./May', count: 28 },
      { date: 'มิ.ย./Jun', count: 25 },
      { date: 'ก.ค./Jul', count: 35 },
    ],
    searchTrends: [
      { date: 'ม.ค./Jan', count: 145 },
      { date: 'ก.พ./Feb', count: 198 },
      { date: 'มี.ค./Mar', count: 234 },
      { date: 'เม.ย./Apr', count: 312 },
      { date: 'พ.ค./May', count: 289 },
      { date: 'มิ.ย./Jun', count: 356 },
      { date: 'ก.ค./Jul', count: 313 },
    ],
    categoryDistribution: [
      { name: 'กฎหมาย / Law', value: 45, color: '#3B82F6' },
      { name: 'นโยบาย / Policy', value: 38, color: '#10B981' },
      { name: 'ระเบียบ / Regulation', value: 42, color: '#F59E0B' },
      { name: 'งานวิจัย / Research', value: 31, color: '#8B5CF6' },
    ],
    popularTags: [
      { tag: 'คุ้มครองข้อมูล', count: 89 },
      { tag: 'ความมั่นคง', count: 76 },
      { tag: 'ไซเบอร์', count: 64 },
      { tag: 'ดิจิทัล', count: 58 },
      { tag: 'ความเป็นส่วนตัว', count: 52 },
      { tag: 'AI', count: 47 },
      { tag: 'blockchain', count: 41 },
      { tag: 'fintech', count: 38 },
      { tag: 'e-commerce', count: 35 },
      { tag: 'cloud computing', count: 32 },
    ],
    knowledgeGraph: {
      nodes: [
        { id: '1', title: 'พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล', type: 'law', tags: ['privacy', 'data'] },
        { id: '2', title: 'นโยบายไซเบอร์', type: 'policy', tags: ['security', 'cyber'] },
        { id: '3', title: 'ระเบียบ IT Security', type: 'regulation', tags: ['security', 'IT'] },
        { id: '4', title: 'งานวิจัย PDPA Impact', type: 'research', tags: ['PDPA', 'business'] },
        { id: '5', title: 'พ.ร.บ. คอมพิวเตอร์', type: 'law', tags: ['cybercrime', 'computer'] },
        { id: '6', title: 'นโยบาย Digital Thailand', type: 'policy', tags: ['digital', 'economy'] },
        { id: '7', title: 'ระเบียบ Cloud Security', type: 'regulation', tags: ['cloud', 'security'] },
      ],
      links: [
        { sourceId: '1', targetId: '2', type: 'relates_to' },
        { sourceId: '1', targetId: '4', type: 'research_on' },
        { sourceId: '2', targetId: '3', type: 'implements' },
        { sourceId: '3', targetId: '7', type: 'extends' },
        { sourceId: '5', targetId: '2', type: 'supports' },
        { sourceId: '6', targetId: '1', type: 'references' },
        { sourceId: '6', targetId: '5', type: 'references' },
      ],
    },
  };
}

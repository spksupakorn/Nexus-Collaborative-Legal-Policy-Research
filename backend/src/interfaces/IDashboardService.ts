export interface DashboardStats {
  totalDocuments: number;
  totalUsers: number;
  totalSearches: number;
  recentDocuments: any[];
  documentTrends: Array<{ date: string; count: number }>;
  searchTrends: Array<{ date: string; count: number }>;
  categoryDistribution: Array<{ name: string; value: number; color: string }>;
  popularTags: Array<{ tag: string; count: number }>;
  knowledgeGraph: {
    nodes: Array<{ id: string; title: string; type: string; tags?: string[] }>;
    links: Array<{ sourceId: string; targetId: string; type: string }>;
  };
}

export interface IDashboardService {
  getDashboardStats(): Promise<DashboardStats>;
}

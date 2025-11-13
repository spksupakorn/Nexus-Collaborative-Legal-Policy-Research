import { injectable } from 'inversify';
import { AppDataSource } from '../config/database';
import { Document } from '../entities/Document';
import { DocumentLink } from '../entities/DocumentLink';
import { SearchLog } from '../entities/SearchLog';
import { IDashboardService, DashboardStats } from '../interfaces/IDashboardService';

@injectable()
export class DashboardService implements IDashboardService {
  private readonly documentRepo = AppDataSource.getRepository(Document);
  private readonly searchLogRepo = AppDataSource.getRepository(SearchLog);
  private readonly linkRepo = AppDataSource.getRepository(DocumentLink);

  async getDashboardStats(): Promise<DashboardStats> {
    // Get total counts
    const totalDocuments = await this.documentRepo.count();
    const totalUsers = await AppDataSource.query('SELECT COUNT(*) FROM users');
    const totalSearches = await this.searchLogRepo.count();
    
    // Get recent documents
    const recentDocuments = await this.documentRepo.find({
      order: { createdAt: 'DESC' },
      take: 5,
      select: ['id', 'titleEn', 'titleTh', 'documentType', 'createdAt'],
    });

    // Get document trends (last 7 months)
    const documentTrends = await this.getDocumentTrends();

    // Get search trends (last 7 months)
    const searchTrends = await this.getSearchTrends();

    // Get category distribution
    const categoryDistribution = await this.getCategoryDistribution();

    // Get popular tags
    const popularTags = await this.getPopularTags();

    // Get knowledge graph data
    const knowledgeGraph = await this.getKnowledgeGraphData();

    return {
      totalDocuments,
      totalUsers: parseInt(totalUsers[0]?.count || '0'),
      totalSearches,
      recentDocuments: recentDocuments.map(doc => ({
        id: doc.id,
        title: doc.titleEn || doc.titleTh,
        type: doc.documentType.toLowerCase(),
        createdAt: doc.createdAt,
      })),
      documentTrends,
      searchTrends,
      categoryDistribution,
      popularTags,
      knowledgeGraph,
    };
  }

  private async getDocumentTrends(): Promise<Array<{ date: string; count: number }>> {
    const trends = await this.documentRepo
      .createQueryBuilder('document')
      .select('DATE_TRUNC(\'month\', document.createdAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('document.createdAt >= NOW() - INTERVAL \'7 months\'')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return trends.map(trend => {
      const date = new Date(trend.month);
      return {
        date: monthNames[date.getMonth()],
        count: parseInt(trend.count),
      };
    });
  }

  private async getSearchTrends(): Promise<Array<{ date: string; count: number }>> {
    const trends = await this.searchLogRepo
      .createQueryBuilder('searchLog')
      .select('DATE_TRUNC(\'month\', searchLog.createdAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('searchLog.createdAt >= NOW() - INTERVAL \'7 months\'')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return trends.map(trend => {
      const date = new Date(trend.month);
      return {
        date: monthNames[date.getMonth()],
        count: parseInt(trend.count),
      };
    });
  }

  private async getCategoryDistribution(): Promise<Array<{ name: string; value: number; color: string }>> {
    const distribution = await this.documentRepo
      .createQueryBuilder('document')
      .select('document.documentType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('document.documentType')
      .getRawMany();

    const colorMap: Record<string, string> = {
      law: '#3B82F6',
      policy: '#10B981',
      regulation: '#F59E0B',
      research: '#8B5CF6',
    };

    const nameMap: Record<string, string> = {
      law: 'กฎหมาย / Law',
      policy: 'นโยบาย / Policy',
      regulation: 'ระเบียบ / Regulation',
      research: 'งานวิจัย / Research',
    };

    return distribution.map(item => ({
      name: nameMap[item.type] || item.type,
      value: parseInt(item.count),
      color: colorMap[item.type] || '#6B7280',
    }));
  }

  private async getPopularTags(): Promise<Array<{ tag: string; count: number }>> {
    // Get all documents with tags
    const documents = await this.documentRepo.find({
      select: ['tags'],
    });

    // Count tag occurrences
    const tagCounts: Record<string, number> = {};
    documents.forEach(doc => {
      if (doc.tags && Array.isArray(doc.tags)) {
        doc.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Convert to array and sort by count
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  private async getKnowledgeGraphData(): Promise<{
    nodes: Array<{ id: string; title: string; type: string; tags?: string[] }>;
    links: Array<{ sourceId: string; targetId: string; type: string }>;
  }> {
    // Get documents for nodes
    const documents = await this.documentRepo.find({
      take: 20,
      order: { createdAt: 'DESC' },
    });

    const nodes = documents.map(doc => ({
      id: doc.id,
      title: doc.titleEn || doc.titleTh,
      type: doc.documentType.toLowerCase(),
      tags: doc.tags || [],
    }));

    // Get links between documents
    const links = await this.linkRepo
      .createQueryBuilder('link')
      .leftJoinAndSelect('link.sourceDocument', 'source')
      .leftJoinAndSelect('link.targetDocument', 'target')
      .where('source.id IN (:...ids)', { ids: documents.map(d => d.id) })
      .andWhere('target.id IN (:...ids)', { ids: documents.map(d => d.id) })
      .getMany();

    return {
      nodes,
      links: links.map(link => ({
        sourceId: link.sourceDocument.id,
        targetId: link.targetDocument.id,
        type: link.linkType.toLowerCase(),
      })),
    };
  }
}

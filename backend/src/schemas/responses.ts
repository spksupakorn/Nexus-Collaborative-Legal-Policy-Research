export const roleSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' }
  }
};

export const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    roles: {
      type: 'array',
      items: roleSchema
    }
  }
};

export const authResponseSchema = {
  type: 'object',
  properties: {
    token: { type: 'string' },
    user: userSchema
  }
};

export const documentSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    titleEn: { type: 'string' },
    titleTh: { type: 'string' },
    summaryEn: { type: ['string', 'null'] },
    summaryTh: { type: ['string', 'null'] },
    contentEn: { type: ['string', 'null'] },
    contentTh: { type: ['string', 'null'] },
    documentType: { type: 'string' },
    sourceUrl: { type: ['string', 'null'] },
    publicationDate: { type: ['string', 'null'] },
    jurisdiction: { type: ['string', 'null'] },
    tags: { type: ['array', 'null'], items: { type: 'string' } },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' }
  }
};

export const searchResultSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    titleEn: { type: 'string' },
    titleTh: { type: 'string' },
    summaryEn: { type: ['string', 'null'] },
    summaryTh: { type: ['string', 'null'] },
    documentType: { type: 'string' },
    score: { type: 'number' },
    highlights: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: { type: 'string' }
      }
    }
  }
};

export const searchResponseSchema = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: searchResultSchema
    },
    total: { type: 'number' },
    page: { type: 'number' },
    limit: { type: 'number' },
    aggregations: {
      type: 'object',
      additionalProperties: true
    }
  }
};

export const recentDocumentSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    type: { type: 'string' },
    createdAt: { type: 'string' }
  }
};

export const dashboardStatsSchema = {
  type: 'object',
  properties: {
    totalDocuments: { type: 'number' },
    totalUsers: { type: 'number' },
    totalSearches: { type: 'number' },
    recentDocuments: {
      type: 'array',
      items: recentDocumentSchema
    },
    documentTrends: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          count: { type: 'number' }
        }
      }
    },
    searchTrends: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          count: { type: 'number' }
        }
      }
    },
    categoryDistribution: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          value: { type: 'number' },
          color: { type: 'string' }
        }
      }
    },
    popularTags: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tag: { type: 'string' },
          count: { type: 'number' }
        }
      }
    },
    knowledgeGraph: {
      type: 'object',
      properties: {
        nodes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              type: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        links: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              sourceId: { type: 'string' },
              targetId: { type: 'string' },
              type: { type: 'string' }
            }
          }
        }
      }
    }
  }
};

export const linkSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    sourceDocumentId: { type: 'string' },
    targetDocumentId: { type: 'string' },
    linkType: { type: 'string' },
    description: { type: ['string', 'null'] },
    createdAt: { type: 'string' }
  }
};

export const graphNodeSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    label: { type: 'string' },
    type: { type: 'string' }
  }
};

export const graphEdgeSchema = {
  type: 'object',
  properties: {
    source: { type: 'string' },
    target: { type: 'string' },
    type: { type: 'string' },
    label: { type: 'string' }
  }
};

export const graphResponseSchema = {
  type: 'object',
  properties: {
    nodes: {
      type: 'array',
      items: graphNodeSchema
    },
    edges: {
      type: 'array',
      items: graphEdgeSchema
    }
  }
};

export const annotationSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    documentId: { type: 'string' },
    content: { type: 'string' },
    startOffset: { type: 'number' },
    endOffset: { type: 'number' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' }
  }
};

export const errorResponseSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    message: { type: 'string' }
  }
};

export const successResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' }
  }
};

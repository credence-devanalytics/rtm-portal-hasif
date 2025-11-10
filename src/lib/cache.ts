/**
 * Caching System for Dashboard API
 * Uses in-memory cache (TanStack Query handles client-side caching)
 * Handles 40k+ rows efficiently by caching aggregated queries
 */

import NodeCache from 'node-cache';
import crypto from 'crypto';

class CacheManager {
  nodeCache: NodeCache;

  constructor() {
    this.nodeCache = new NodeCache({ 
      stdTTL: 300, // 5 minutes default TTL
      checkperiod: 60, // Check for expired keys every minute
      useClones: false // Better performance for large objects
    });
  }

  /**
   * Generate cache key based on filters and query type
   * @param {string} queryType - Type of query (sentiment, platform, timeseries, etc.)
   * @param {Object} filters - Filter parameters
   * @returns {string} Hashed cache key
   */
  generateCacheKey(queryType, filters = {}) {
    // Sort filters to ensure consistent key generation
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((result, key) => {
        result[key] = filters[key];
        return result;
      }, {});

    const keyString = `${queryType}:${JSON.stringify(sortedFilters)}`;
    
    // Hash the key to ensure consistent length and avoid special characters
    return crypto.createHash('md5').update(keyString).digest('hex');
  }

  /**
   * Get cached data
   * @param {string} cacheKey - Cache key
   * @returns {Promise<any|null>} Cached data or null if not found
   */
  async get(cacheKey) {
    try {
      // Use in-memory cache (TanStack Query handles client-side)
      return this.nodeCache.get(cacheKey) || null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data
   * @param {string} cacheKey - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttlSeconds - Time to live in seconds (default: 300 = 5 minutes)
   */
  async set(cacheKey, data, ttlSeconds = 300) {
    try {
      // Use in-memory cache (TanStack Query handles client-side)
      this.nodeCache.set(cacheKey, data, ttlSeconds);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete cached data
   * @param {string} cacheKey - Cache key to delete
   */
  async delete(cacheKey) {
    try {
      this.nodeCache.del(cacheKey);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    try {
      this.nodeCache.flushAll();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  async getStats() {
    const stats: any = {
      cacheType: 'in-memory',
      nodeCacheStats: this.nodeCache.getStats()
    };

    return stats;
  }

  /**
   * Cached query executor
   * @param {string} queryType - Type of query for cache key
   * @param {Object} filters - Query filters
   * @param {Function} queryFunction - Function that executes the actual query
   * @param {number} ttlSeconds - Cache TTL in seconds
   * @returns {Promise<any>} Query result (cached or fresh)
   */
  async cachedQuery(queryType, filters, queryFunction, ttlSeconds = 300) {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(queryType, filters);
    
    // Try to get from cache first
    let cachedResult = await this.get(cacheKey);
    
    if (cachedResult && typeof cachedResult === 'object') {
      console.log(`Cache HIT for ${queryType} (${Date.now() - startTime}ms) - Key: ${cacheKey}`);
      return {
        ...cachedResult,
        _cache: {
          hit: true,
          key: cacheKey,
          responseTime: Date.now() - startTime
        }
      };
    }

    // Cache miss - execute query
    console.log(`Cache MISS for ${queryType} - Executing query...`);
    
    try {
      const result = await queryFunction();
      
      // Cache the result
      await this.set(cacheKey, result, ttlSeconds);
      
      console.log(`Query executed and cached for ${queryType} (${Date.now() - startTime}ms) - Key: ${cacheKey}`);
      
      return {
        ...result,
        _cache: {
          hit: false,
          key: cacheKey,
          responseTime: Date.now() - startTime
        }
      };
    } catch (error) {
      console.error(`Query execution error for ${queryType}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

export default cacheManager;

/**
 * Helper function to create filter object from query parameters
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {Object} Normalized filter object
 */
export function createFiltersFromParams(searchParams) {
  return {
    days: searchParams.get('days') || '30',
    platform: searchParams.get('platform') || 'all',
    unit: searchParams.get('unit') || 'all',
    fromDate: searchParams.get('from') || null,
    toDate: searchParams.get('to') || null,
    sentiment: searchParams.get('sentiment') || 'all',
    author: searchParams.get('author') || null, // Add author filter
    limit: searchParams.get('limit') || '50'
  };
}

/**
 * Helper function to build database WHERE conditions from filters
 * @param {Object} filters - Filter object
 * @param {Object} schema - Database schema object
 * @returns {Array} Array of WHERE conditions
 */
export function buildWhereConditions(filters, schema) {
  const { gte, sql, and } = require('drizzle-orm');
  
  console.log('🔧 buildWhereConditions called with:', {
    filters,
    hasChannel: !!filters.channel,
    channelValue: filters.channel,
    channelType: typeof filters.channel
  });
  
  let whereConditions = [];
  
  // Date filtering
  let cutoffDate, endDate;
  
  if (filters.fromDate && filters.toDate) {
    cutoffDate = new Date(filters.fromDate);
    endDate = new Date(filters.toDate);
    whereConditions.push(gte(schema.inserttime, cutoffDate.toISOString()));
    whereConditions.push(sql`${schema.inserttime} <= ${endDate.toISOString()}`);
  } else {
    cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(filters.days));
    whereConditions.push(gte(schema.inserttime, cutoffDate.toISOString()));
  }
  
  // Platform filtering
  if (filters.platform && filters.platform !== 'all') {
    whereConditions.push(
      sql`LOWER(${schema.type}) LIKE ${`%${filters.platform.toLowerCase()}%`}`
    );
  }
  
  // Unit/Group filtering
  if (filters.unit && filters.unit !== 'all') {
    const unitLower = filters.unit.toLowerCase();
    
    // Match the CASE logic used in queries for consistent filtering
    if (unitLower === 'berita' || unitLower === 'news') {
      // Match both "berita" and "news" for the News/Berita unit
      whereConditions.push(
        sql`(LOWER(${schema.groupname}) LIKE '%berita%' OR LOWER(${schema.groupname}) LIKE '%news%')`
      );
    } else if (unitLower === 'radio') {
      whereConditions.push(
        sql`LOWER(${schema.groupname}) LIKE '%radio%'`
      );
    } else if (unitLower === 'tv') {
      whereConditions.push(
        sql`LOWER(${schema.groupname}) LIKE '%tv%'`
      );
    } else if (unitLower === 'official') {
      whereConditions.push(
        sql`LOWER(${schema.groupname}) LIKE '%official%'`
      );
    } else {
      // Fallback: generic LIKE match for any other unit value
      whereConditions.push(
        sql`LOWER(${schema.groupname}) LIKE ${`%${unitLower}%`}`
      );
    }
  }
  
  // Sentiment filtering
  if (filters.sentiment && filters.sentiment !== 'all') {
    whereConditions.push(
      sql`LOWER(${schema.sentiment}) = ${filters.sentiment.toLowerCase()}`
    );
  }
  
  // Channel filtering (for cross-filtering by channel)
  // Filter by 'channel' field which contains channel names
  if (filters.channel && filters.channel !== '' && filters.channel !== 'all') {
    console.log('🔍 Building channel WHERE clause:', {
      filterValue: filters.channel,
      filterType: typeof filters.channel,
      filterLength: filters.channel.length
    });
    
    // Filter by channel field using ILIKE for case-insensitive partial match
    whereConditions.push(
      sql`${schema.channel} ILIKE ${`%${filters.channel}%`}`
    );
  }
  
  return whereConditions;
}

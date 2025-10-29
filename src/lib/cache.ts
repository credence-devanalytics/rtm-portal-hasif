/**
 * Caching System for Dashboard API
 * Supports Redis with fallback to in-memory cache
 * Handles 40k+ rows efficiently by caching aggregated queries
 */

import { createClient } from 'redis';
import NodeCache from 'node-cache';
import crypto from 'crypto';

class CacheManager {
  redis: any;
  nodeCache: NodeCache;
  isRedisConnected: boolean;

  constructor() {
    this.redis = null;
    this.nodeCache = new NodeCache({ 
      stdTTL: 300, // 5 minutes default TTL
      checkperiod: 60, // Check for expired keys every minute
      useClones: false // Better performance for large objects
    });
    this.isRedisConnected = false;
    this.initRedis();
  }

  /**
   * Initialize Redis connection with fallback
   */
  async initRedis() {
    try {
      // Try to connect to Redis
      this.redis = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000
        }
      });

      this.redis.on('error', (err) => {
        console.warn('Redis connection error, falling back to in-memory cache:', err.message);
        this.isRedisConnected = false;
      });

      this.redis.on('connect', () => {
        console.log('Redis connected successfully');
        this.isRedisConnected = true;
      });

      // Attempt connection
      await this.redis.connect();
      this.isRedisConnected = true;
    } catch (error) {
      console.warn('Redis unavailable, using in-memory cache:', error.message);
      this.isRedisConnected = false;
    }
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
      if (this.isRedisConnected && this.redis) {
        const data = await this.redis.get(cacheKey);
        if (data) {
          return JSON.parse(data);
        }
      }
      
      // Fallback to node-cache
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
      if (this.isRedisConnected && this.redis) {
        await this.redis.setEx(cacheKey, ttlSeconds, JSON.stringify(data));
      } else {
        // Fallback to node-cache
        this.nodeCache.set(cacheKey, data, ttlSeconds);
      }
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
      if (this.isRedisConnected && this.redis) {
        await this.redis.del(cacheKey);
      }
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
      if (this.isRedisConnected && this.redis) {
        await this.redis.flushAll();
      }
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
      redisConnected: this.isRedisConnected,
      nodeCacheStats: this.nodeCache.getStats()
    };

    if (this.isRedisConnected && this.redis) {
      try {
        const info = await this.redis.info('memory');
        stats.redisMemory = info;
      } catch (error) {
        stats.redisError = (error as Error).message;
      }
    }

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
    
    if (cachedResult) {
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
    whereConditions.push(
      sql`LOWER(${schema.groupname}) LIKE ${`%${filters.unit.toLowerCase()}%`}`
    );
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

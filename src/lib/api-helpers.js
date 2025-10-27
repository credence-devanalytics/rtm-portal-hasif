/**
 * API Helper Functions
 * Shared utilities for API routes
 */

import { gte, lte, inArray, like, sql, or } from 'drizzle-orm';

/**
 * Build WHERE conditions for database queries from filters
 * @param {Object} filters - Filter object
 * @param {Object} schema - Database schema object (e.g., mentionsClassifyPublic)
 * @returns {Array} Array of WHERE conditions
 */
export const buildWhereConditions = (filters, schema) => {
  const conditions = [];

  // Date range filters
  if (filters.dateRange?.from) {
    conditions.push(gte(schema.inserttime, `${filters.dateRange.from}T00:00:00.000Z`));
  }
  
  if (filters.dateRange?.to) {
    conditions.push(lte(schema.inserttime, `${filters.dateRange.to}T23:59:59.999Z`));
  }

  // Sentiment filters
  if (filters.sentiments && filters.sentiments.length > 0) {
    conditions.push(inArray(schema.autosentiment, filters.sentiments));
  }

  // Source/Platform filters
  if (filters.sources && filters.sources.length > 0) {
    const sourceConditions = filters.sources.map(source => 
      like(schema.type, `%${source}%`)
    );
    if (sourceConditions.length === 1) {
      conditions.push(sourceConditions[0]);
    } else {
      conditions.push(or(...sourceConditions));
    }
  }

  // Author filters
  if (filters.authors && filters.authors.length > 0) {
    conditions.push(inArray(schema.author, filters.authors));
  }

  // Topic filters (if applicable)
  if (filters.topics && filters.topics.length > 0 && schema.topic) {
    const topicConditions = filters.topics.map(topic => 
      like(schema.topic, `%${topic}%`)
    );
    if (topicConditions.length === 1) {
      conditions.push(topicConditions[0]);
    } else {
      conditions.push(or(...topicConditions));
    }
  }

  return conditions;
};

/**
 * Parse filter parameters from URL search params
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {Object} Parsed filter object
 */
export const parseFilterParams = (searchParams) => {
  const sentimentsParam = searchParams.get('sentiments');
  const sourcesParam = searchParams.get('sources');
  const authorsParam = searchParams.get('authors');
  const topicsParam = searchParams.get('topics');
  const dateFromParam = searchParams.get('date_from');
  const dateToParam = searchParams.get('date_to');

  return {
    sentiments: sentimentsParam ? sentimentsParam.split(',') : [],
    sources: sourcesParam ? sourcesParam.split(',') : [],
    authors: authorsParam ? authorsParam.split(',') : [],
    topics: topicsParam ? topicsParam.split(',') : [],
    dateRange: {
      from: dateFromParam,
      to: dateToParam
    }
  };
};

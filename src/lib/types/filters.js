/**
 * Filter Types for Social Media Dashboard
 * Contains type definitions and constants for filtering functionality
 */

// Filter parameter structure
export const FilterParams = {
  sentiments: [], // ['positive', 'negative', 'neutral']
  sources: [],    // ['facebook', 'twitter', 'instagram', 'linkedin'] 
  topics: [],     // ['technology', 'healthcare', 'education', etc.]
  dateRange: {    // { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
    from: '',
    to: ''
  }
};

// Available sentiment options
export const SENTIMENT_OPTIONS = [
  { value: 'positive', label: 'Positive', color: 'bg-green-100 text-green-800' },
  { value: 'negative', label: 'Negative', color: 'bg-red-100 text-red-800' },
  { value: 'neutral', label: 'Neutral', color: 'bg-gray-100 text-gray-800' }
];

// Available source platforms
export const SOURCE_OPTIONS = [
  { value: 'facebook', label: 'Facebook', color: 'bg-blue-100 text-blue-800' },
  { value: 'twitter', label: 'Twitter', color: 'bg-sky-100 text-sky-800' },
  { value: 'instagram', label: 'Instagram', color: 'bg-pink-100 text-pink-800' },
  { value: 'linkedin', label: 'LinkedIn', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'youtube', label: 'YouTube', color: 'bg-red-100 text-red-800' },
  { value: 'tiktok', label: 'TikTok', color: 'bg-purple-100 text-purple-800' }
];

// Filter utility functions
export const filterUtils = {
  // Create filter object from URL params
  fromUrlParams: (searchParams) => {
    const sentiments = searchParams.get('sentiments');
    const sources = searchParams.get('sources');
    const topics = searchParams.get('topics');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    return {
      sentiments: sentiments ? sentiments.split(',') : [],
      sources: sources ? sources.split(',') : [],
      topics: topics ? topics.split(',') : [],
      dateRange: {
        from: dateFrom || '',
        to: dateTo || ''
      }
    };
  },

  // Convert filter object to URL params
  toUrlParams: (filters) => {
    const params = new URLSearchParams();
    
    if (filters.sentiments && filters.sentiments.length > 0) {
      params.set('sentiments', filters.sentiments.join(','));
    }
    
    if (filters.sources && filters.sources.length > 0) {
      params.set('sources', filters.sources.join(','));
    }
    
    if (filters.topics && filters.topics.length > 0) {
      params.set('topics', filters.topics.join(','));
    }
    
    if (filters.dateRange.from) {
      params.set('date_from', filters.dateRange.from);
    }
    
    if (filters.dateRange.to) {
      params.set('date_to', filters.dateRange.to);
    }
    
    return params;
  },

  // Count active filters
  getActiveFilterCount: (filters) => {
    let count = 0;
    if (filters.sentiments && filters.sentiments.length > 0) count += filters.sentiments.length;
    if (filters.sources && filters.sources.length > 0) count += filters.sources.length;
    if (filters.topics && filters.topics.length > 0) count += filters.topics.length;
    if (filters.dateRange.from || filters.dateRange.to) count += 1;
    return count;
  },

  // Clear all filters
  clearAll: () => ({
    sentiments: [],
    sources: [],
    topics: [],
    dateRange: { from: '', to: '' }
  }),

  // Check if filters are empty
  isEmpty: (filters) => {
    return (
      (!filters.sentiments || filters.sentiments.length === 0) &&
      (!filters.sources || filters.sources.length === 0) &&
      (!filters.topics || filters.topics.length === 0) &&
      (!filters.dateRange.from && !filters.dateRange.to)
    );
  }
};

// Default filter state
export const DEFAULT_FILTERS = {
  sentiments: [],
  sources: [],
  topics: [],
  dateRange: {
    from: '',
    to: ''
  }
};
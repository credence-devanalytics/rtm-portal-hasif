/**
 * Cache Management API
 * Provides endpoints to monitor and manage the caching system
 */

import { NextResponse } from 'next/server';
import cacheManager from '@/lib/cache';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'stats':
        // Get cache statistics
        const stats = await cacheManager.getStats();
        return NextResponse.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        });
        
      case 'health':
        // Health check for cache system
        const healthData = {
          redis: {
            connected: cacheManager.isRedisConnected,
            status: cacheManager.isRedisConnected ? 'healthy' : 'disconnected'
          },
          nodeCache: {
            status: 'healthy',
            stats: cacheManager.nodeCache.getStats()
          },
          overall: cacheManager.isRedisConnected ? 'optimal' : 'fallback'
        };
        
        return NextResponse.json({
          success: true,
          data: healthData,
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json({
          success: true,
          message: 'Cache management API',
          availableActions: ['stats', 'health', 'clear'],
          endpoints: {
            stats: '/api/cache?action=stats',
            health: '/api/cache?action=health',
            clear: 'DELETE /api/cache'
          }
        });
    }
    
  } catch (error) {
    console.error('Cache API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process cache request', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const confirm = searchParams.get('confirm');
    
    if (confirm !== 'true') {
      return NextResponse.json({
        success: false,
        error: 'Cache clear requires confirmation',
        hint: 'Add ?confirm=true to the request to clear the cache'
      }, { status: 400 });
    }
    
    // Clear all cache
    await cacheManager.clear();
    
    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cache', details: error.message },
      { status: 500 }
    );
  }
}

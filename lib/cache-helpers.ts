/**
 * Cache Invalidation Helpers
 *
 * Helper functions to invalidate dashboard cache when data changes.
 * Call these functions after creating/updating/deleting relevant entities.
 */

import { revalidateTag } from 'next/cache'

/**
 * Invalidate all dashboard caches
 * Call this when any data that affects dashboard is modified
 */
export function invalidateDashboardCache() {
  console.log('[CACHE] Invalidating dashboard cache')
  try {
    revalidateTag('dashboard', {})
  } catch (error) {
    console.error('[CACHE] Error invalidating dashboard cache:', error)
  }
}

/**
 * Invalidate dashboard stats cache specifically
 * Call this when stats-related data changes (new surgery, follow-up response, etc)
 */
export function invalidateDashboardStats() {
  console.log('[CACHE] Invalidating dashboard stats cache')
  try {
    revalidateTag('dashboard-stats', {})
  } catch (error) {
    console.error('[CACHE] Error invalidating dashboard-stats cache:', error)
  }
}

/**
 * Invalidate dashboard patients cache specifically
 * Call this when patient list changes (new patient, surgery update, etc)
 */
export function invalidateDashboardPatients() {
  console.log('[CACHE] Invalidating dashboard patients cache')
  try {
    revalidateTag('dashboard-patients', {})
  } catch (error) {
    console.error('[CACHE] Error invalidating dashboard-patients cache:', error)
  }
}

/**
 * Complete cache invalidation for all dashboard-related data
 * Use this for major data changes that affect everything
 */
export function invalidateAllDashboardData() {
  console.log('[CACHE] Complete dashboard cache invalidation')
  invalidateDashboardStats()
  invalidateDashboardPatients()
  invalidateDashboardCache()
}

// ============================================
// WHEN TO USE THESE FUNCTIONS
// ============================================

/**
 * USAGE EXAMPLES:
 *
 * 1. After creating a new patient:
 *    await prisma.patient.create({...})
 *    invalidateDashboardPatients()
 *
 * 2. After creating/updating a surgery:
 *    await prisma.surgery.update({...})
 *    invalidateAllDashboardData()
 *
 * 3. After a follow-up response is received:
 *    await prisma.followUpResponse.create({...})
 *    invalidateDashboardStats()
 *
 * 4. After marking a follow-up as completed:
 *    await prisma.followUp.update({...})
 *    invalidateDashboardStats()
 *
 * 5. After updating research participant status:
 *    await prisma.patient.update({...})
 *    invalidateDashboardPatients()
 */

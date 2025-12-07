/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { buildErrorResponse } from '@/lib/api-utils';

// ============================================
// CACHED DASHBOARD STATS FUNCTION
// ============================================

const getCachedDashboardStats = unstable_cache(
  async () => {
    const startTime = Date.now();

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get date 7 days ago
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Execute all queries in parallel for better performance
    const [
      totalActivePatients,
      totalPendingFollowUps,
      pendingFollowUpsToday,
      overdueFollowUps,
      highRiskAlerts,
      recentSurgeries,
      allSurgeries,
    ] = await Promise.all([
      // Total active patients
      prisma.patient.count({
        where: {
          surgeries: {
            some: {
              status: 'active',
            },
          },
        },
      }),

      // Total pending follow-ups
      prisma.followUp.count({
        where: {
          status: 'pending',
        },
      }),

      // Pending follow-ups scheduled for today
      prisma.followUp.count({
        where: {
          status: 'pending',
          scheduledDate: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Overdue follow-ups
      prisma.followUp.count({
        where: {
          status: 'overdue',
        },
      }),

      // High-risk alerts (responses with high or critical risk level)
      prisma.followUpResponse.count({
        where: {
          OR: [{ riskLevel: 'high' }, { riskLevel: 'critical' }],
          doctorAlerted: false, // Not yet alerted
        },
      }),

      // Recent surgeries (last 7 days)
      prisma.surgery.count({
        where: {
          date: {
            gte: sevenDaysAgo,
          },
        },
      }),

      // Get all surgeries for average completion rate
      prisma.surgery.findMany({
        select: {
          dataCompleteness: true,
        },
      }),
    ]);

    // Calculate average completion rate
    const totalCompleteness = allSurgeries.reduce(
      (sum, surgery) => sum + (surgery.dataCompleteness || 0),
      0
    );
    const averageCompletionRate =
      allSurgeries.length > 0 ? Math.round(totalCompleteness / allSurgeries.length) : 0;

    // Get pending follow-ups details for today
    const todayFollowUps = await prisma.followUp.findMany({
      where: {
        status: 'pending',
        scheduledDate: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        surgery: {
          select: {
            id: true,
            type: true,
            date: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
      take: 10, // Limit to 10 for performance
    });

    // Get high-risk alerts details
    const highRiskAlertsDetails = await prisma.followUpResponse.findMany({
      where: {
        OR: [{ riskLevel: 'high' }, { riskLevel: 'critical' }],
        doctorAlerted: false,
      },
      include: {
        followUp: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
            surgery: {
              select: {
                id: true,
                type: true,
                date: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to 10 for performance
    });

    // Get recent surgeries details
    const recentSurgeriesDetails = await prisma.surgery.findMany({
      where: {
        date: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: 10,
    });

    // Get completion distribution
    const completionDistribution = {
      low: allSurgeries.filter((s) => s.dataCompleteness < 50).length,
      medium: allSurgeries.filter(
        (s) => s.dataCompleteness >= 50 && s.dataCompleteness < 80
      ).length,
      high: allSurgeries.filter((s) => s.dataCompleteness >= 80).length,
    };

    // Get follow-up status distribution
    const followUpStats = await prisma.followUp.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const followUpDistribution = followUpStats.reduce(
      (acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get surgery type distribution
    const surgeryTypeStats = await prisma.surgery.groupBy({
      by: ['type'],
      _count: {
        type: true,
      },
      where: {
        status: 'active',
      },
    });

    const surgeryTypeDistribution = surgeryTypeStats.reduce(
      (acc, stat) => {
        acc[stat.type] = stat._count.type;
        return acc;
      },
      {} as Record<string, number>
    );

    const duration = Date.now() - startTime;
    console.log(`[CACHE] Dashboard stats computed in ${duration}ms`);

    // Build response data
    return {
      success: true,
      data: {
        summary: {
          totalActivePatients,
          totalPendingFollowUps,
          pendingFollowUpsToday,
          overdueFollowUps,
          highRiskAlerts,
          recentSurgeries,
          averageCompletionRate,
        },
        completionDistribution,
        followUpDistribution,
        surgeryTypeDistribution,
        todayFollowUps: todayFollowUps.map((f) => ({
          id: f.id,
          dayNumber: f.dayNumber,
          scheduledDate: f.scheduledDate,
          patient: {
            id: f.patient.id,
            name: f.patient.name,
            phone: f.patient.phone,
          },
          surgery: {
            id: f.surgery.id,
            type: f.surgery.type,
            date: f.surgery.date,
          },
        })),
        highRiskAlertsDetails: highRiskAlertsDetails.map((alert) => ({
          id: alert.id,
          riskLevel: alert.riskLevel,
          redFlags: alert.redFlags ? JSON.parse(alert.redFlags) : [],
          createdAt: alert.createdAt,
          followUp: {
            id: alert.followUp.id,
            dayNumber: alert.followUp.dayNumber,
          },
          patient: {
            id: alert.followUp.patient.id,
            name: alert.followUp.patient.name,
            phone: alert.followUp.patient.phone,
          },
          surgery: {
            id: alert.followUp.surgery.id,
            type: alert.followUp.surgery.type,
            date: alert.followUp.surgery.date,
          },
        })),
        recentSurgeriesDetails: recentSurgeriesDetails.map((surgery) => ({
          id: surgery.id,
          type: surgery.type,
          date: surgery.date,
          hospital: surgery.hospital,
          dataCompleteness: surgery.dataCompleteness,
          status: surgery.status,
          patient: {
            id: surgery.patient.id,
            name: surgery.patient.name,
            phone: surgery.patient.phone,
          },
        })),
      },
    };
  },
  ['dashboard-stats'], // Cache key
  {
    revalidate: 300, // 5 minutes
    tags: ['dashboard', 'dashboard-stats'], // Tags for manual invalidation
  }
);

// ============================================
// GET - DASHBOARD STATISTICS
// ============================================

export async function GET() {
  try {
    const startTime = Date.now();
    const stats = await getCachedDashboardStats();
    const duration = Date.now() - startTime;

    console.log(`[CACHE] Dashboard stats request served in ${duration}ms`);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      buildErrorResponse(
        'Failed to fetch dashboard statistics',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

// ============================================
// POST - CUSTOM STATS QUERY
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dateFrom, dateTo, surgeryType } = body;

    const where: any = {};

    if (dateFrom || dateTo) {
      where.date = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      };
    }

    if (surgeryType) {
      where.type = surgeryType;
    }

    const [totalSurgeries, avgCompleteness, surgeries] = await Promise.all([
      prisma.surgery.count({ where }),
      prisma.surgery.aggregate({
        where,
        _avg: {
          dataCompleteness: true,
          durationMinutes: true,
        },
      }),
      prisma.surgery.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              age: true,
              sex: true,
            },
          },
          followUps: {
            include: {
              responses: {
                select: {
                  riskLevel: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Calculate risk level distribution
    const riskLevelDistribution = surgeries.reduce(
      (acc, surgery) => {
        surgery.followUps.forEach((followUp) => {
          followUp.responses.forEach((response) => {
            acc[response.riskLevel] = (acc[response.riskLevel] || 0) + 1;
          });
        });
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      success: true,
      data: {
        totalSurgeries,
        averageCompleteness: Math.round(avgCompleteness._avg.dataCompleteness || 0),
        averageDuration: Math.round(avgCompleteness._avg.durationMinutes || 0),
        riskLevelDistribution,
        filters: {
          dateFrom,
          dateTo,
          surgeryType,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching custom stats:', error);
    return NextResponse.json(
      buildErrorResponse(
        'Failed to fetch custom statistics',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

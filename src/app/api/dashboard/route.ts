import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get counts
    const activeCount = await db.freight.count({
      where: { status: 'ACTIVE' }
    });

    const problemCount = await db.freight.count({
      where: { status: 'PROBLEM' }
    });

    const completedToday = await db.freight.count({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    // Monthly stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthlyFreights = await db.freight.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        status: 'COMPLETED'
      },
      include: {
        payments: true
      }
    });

    const totalBrokerFreight = monthlyFreights.reduce((sum, f) => sum + f.brokerFreight, 0);
    
    // Pending driver payments
    const pendingPayments = await db.payment.findMany({
      where: {
        direction: 'OUTGOING',
        status: 'PENDING'
      },
      include: {
        freight: true
      }
    });

    const totalPendingDriver = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    // Problem loads
    const problemLoads = await db.freight.findMany({
      where: { status: 'PROBLEM' },
      include: {
        truck: true,
        contacts: {
          include: {
            contact: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Recent active loads
    const recentLoads = await db.freight.findMany({
      where: { status: 'ACTIVE' },
      include: {
        truck: true,
        contacts: {
          include: {
            contact: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      activeCount,
      problemCount,
      completedToday,
      monthlyRevenue: totalBrokerFreight,
      pendingDriverPayment: totalPendingDriver,
      problemLoads,
      recentLoads
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

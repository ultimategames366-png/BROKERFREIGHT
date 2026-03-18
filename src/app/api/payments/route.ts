import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const freightId = searchParams.get('freightId');
    const status = searchParams.get('status');

    if (freightId) {
      const payments = await db.payment.findMany({
        where: { freightId },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ payments });
    }

    if (status) {
      const payments = await db.payment.findMany({
        where: { status },
        include: {
          freight: {
            include: {
              truck: true,
              contacts: {
                include: { contact: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ payments });
    }

    const payments = await db.payment.findMany({
      include: {
        freight: {
          include: { truck: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

// CREATE payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { freightId, paymentType, amount, direction, status, paymentDate, notes } = body;

    const payment = await db.payment.create({
      data: {
        freightId,
        paymentType,
        amount: parseFloat(amount),
        direction,
        status: status || 'PENDING',
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        notes
      }
    });

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

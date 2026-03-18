import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET all trucks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const lastFour = searchParams.get('lastFour');

    if (lastFour) {
      const trucks = await db.truck.findMany({
        where: {
          lastFourDigits: lastFour
        },
        include: {
          freights: {
            take: 5,
            orderBy: { createdAt: 'desc' }
          },
          truckNotes: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });
      return NextResponse.json({ trucks });
    }

    if (search) {
      const trucks = await db.truck.findMany({
        where: {
          OR: [
            { truckNumber: { contains: search.toUpperCase() } },
            { lastFourDigits: { contains: search } }
          ]
        },
        include: {
          freights: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              contacts: {
                include: { contact: true }
              }
            }
          },
          truckNotes: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });
      return NextResponse.json({ trucks });
    }

    const trucks = await db.truck.findMany({
      include: {
        freights: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            contacts: {
              include: { contact: true }
            }
          }
        },
        truckNotes: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ trucks });
  } catch (error) {
    console.error('Error fetching trucks:', error);
    return NextResponse.json({ error: 'Failed to fetch trucks' }, { status: 500 });
  }
}

// CREATE new truck
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { truckNumber, notes } = body;

    const lastFourDigits = truckNumber.slice(-4).toUpperCase();

    const truck = await db.truck.create({
      data: {
        truckNumber: truckNumber.toUpperCase(),
        lastFourDigits,
        notes
      }
    });

    return NextResponse.json({ truck });
  } catch (error) {
    console.error('Error creating truck:', error);
    return NextResponse.json({ error: 'Failed to create truck' }, { status: 500 });
  }
}

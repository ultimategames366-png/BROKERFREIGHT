import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET all contacts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    if (search) {
      const contacts = await db.contact.findMany({
        where: {
          OR: [
            { name: { contains: search } },
            { phoneNumber: { contains: search } },
            { altPhone: { contains: search } }
          ]
        },
        include: {
          freights: {
            include: {
              freight: {
                include: { truck: true }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      });
      return NextResponse.json({ contacts });
    }

    const contacts = await db.contact.findMany({
      include: {
        freights: {
          include: {
            freight: {
              include: { truck: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

// CREATE new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phoneNumber, altPhone, notes } = body;

    const contact = await db.contact.create({
      data: {
        name,
        phoneNumber,
        altPhone,
        notes
      }
    });

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}

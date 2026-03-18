import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET notes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const freightId = searchParams.get('freightId');
    const truckId = searchParams.get('truckId');

    if (freightId) {
      const notes = await db.note.findMany({
        where: { freightId },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ notes });
    }

    if (truckId) {
      const notes = await db.truckNote.findMany({
        where: { truckId },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ notes });
    }

    return NextResponse.json({ notes: [] });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

// CREATE note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { freightId, truckId, tag, description } = body;

    if (freightId) {
      const note = await db.note.create({
        data: { freightId, tag, description }
      });
      
      // Update freight status to PROBLEM if needed
      if (tag.toLowerCase().includes('problem') || tag.toLowerCase().includes('issue')) {
        await db.freight.update({
          where: { id: freightId },
          data: { status: 'PROBLEM' }
        });
      }
      
      return NextResponse.json({ note });
    }

    if (truckId) {
      const note = await db.truckNote.create({
        data: { truckId, tag, description }
      });
      
      // Update truck hasProblems flag if needed
      if (tag.toLowerCase().includes('problem')) {
        await db.truck.update({
          where: { id: truckId },
          data: { hasProblems: true }
        });
      }
      
      return NextResponse.json({ note });
    }

    return NextResponse.json({ error: 'Missing freightId or truckId' }, { status: 400 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

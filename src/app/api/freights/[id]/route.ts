import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET single freight
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const freight = await db.freight.findUnique({
      where: { id },
      include: {
        truck: true,
        contacts: {
          include: {
            contact: true
          }
        },
        notes: true,
        extraCharges: true,
        payments: true,
        attachments: true
      }
    });

    if (!freight) {
      return NextResponse.json({ error: 'Freight not found' }, { status: 404 });
    }

    return NextResponse.json({ freight });
  } catch (error) {
    console.error('Error fetching freight:', error);
    return NextResponse.json({ error: 'Failed to fetch freight' }, { status: 500 });
  }
}

// UPDATE freight
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    };
    
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    }
    if (body.pickupLocation) updateData.pickupLocation = body.pickupLocation;
    if (body.dropLocation) updateData.dropLocation = body.dropLocation;
    if (body.distanceKm !== undefined) updateData.distanceKm = body.distanceKm;
    if (body.weight) updateData.weight = body.weight;
    if (body.weightType) updateData.weightType = body.weightType;
    if (body.brokerFreight) updateData.brokerFreight = body.brokerFreight;
    if (body.driverFreight) updateData.driverFreight = body.driverFreight;

    const freight = await db.freight.update({
      where: { id },
      data: updateData,
      include: {
        truck: true,
        contacts: {
          include: {
            contact: true
          }
        }
      }
    });

    return NextResponse.json({ freight });
  } catch (error) {
    console.error('Error updating freight:', error);
    return NextResponse.json({ error: 'Failed to update freight' }, { status: 500 });
  }
}

// DELETE freight
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.freight.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting freight:', error);
    return NextResponse.json({ error: 'Failed to delete freight' }, { status: 500 });
  }
}

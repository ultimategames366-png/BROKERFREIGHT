import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET all freights with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const truckId = searchParams.get('truckId');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    
    if (status) {
      where.status = status;
    }
    
    if (truckId) {
      where.truckId = truckId;
    }

    if (search) {
      const freights = await db.freight.findMany({
        where,
        include: {
          truck: true,
          contacts: {
            include: {
              contact: true
            }
          },
          notes: true,
          extraCharges: true,
          payments: true
        },
        orderBy: { createdAt: 'desc' }
      });

      const filtered = freights.filter(f => 
        f.truck.truckNumber.toLowerCase().includes(search.toLowerCase()) ||
        f.truck.lastFourDigits.includes(search) ||
        f.pickupLocation.toLowerCase().includes(search.toLowerCase()) ||
        f.dropLocation.toLowerCase().includes(search.toLowerCase()) ||
        f.contacts.some(c => 
          c.contact.name.toLowerCase().includes(search.toLowerCase()) ||
          c.contact.phoneNumber.includes(search)
        )
      );

      return NextResponse.json({ freights: filtered });
    }

    const freights = await db.freight.findMany({
      where,
      include: {
        truck: true,
        contacts: {
          include: {
            contact: true
          }
        },
        notes: true,
        extraCharges: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ freights });
  } catch (error) {
    console.error('Error fetching freights:', error);
    return NextResponse.json({ error: 'Failed to fetch freights' }, { status: 500 });
  }
}

// CREATE new freight
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      truckNumber,
      lastFourDigits,
      pickupLocation,
      dropLocation,
      distanceKm,
      weight,
      weightType,
      freightType,
      brokerFreight,
      driverFreight,
      pickupDate,
      contacts
    } = body;

    // Create or find truck
    let truck = await db.truck.findUnique({
      where: { truckNumber }
    });

    if (!truck) {
      truck = await db.truck.create({
        data: {
          truckNumber,
          lastFourDigits: lastFourDigits || truckNumber.slice(-4)
        }
      });
    }

    // Create freight
    const freight = await db.freight.create({
      data: {
        truckId: truck.id,
        pickupLocation,
        dropLocation,
        distanceKm: distanceKm ? parseFloat(distanceKm) : null,
        weight: parseFloat(weight),
        weightType,
        freightType,
        brokerFreight: parseFloat(brokerFreight),
        driverFreight: parseFloat(driverFreight),
        pickupDate: pickupDate ? new Date(pickupDate) : null,
        contacts: contacts ? {
          create: await Promise.all(contacts.map(async (c: { phone: string; name: string; role: string }) => {
            let contact = await db.contact.findUnique({
              where: { phoneNumber: c.phone }
            });
            if (!contact) {
              contact = await db.contact.create({
                data: {
                  name: c.name,
                  phoneNumber: c.phone
                }
              });
            }
            return {
              contactId: contact.id,
              role: c.role
            };
          }))
        } : undefined
      },
      include: {
        truck: true,
        contacts: {
          include: {
            contact: true
          }
        },
        notes: true,
        extraCharges: true,
        payments: true
      }
    });

    // Update truck stats
    await db.truck.update({
      where: { id: truck.id },
      data: { totalTrips: { increment: 1 } }
    });

    return NextResponse.json({ freight });
  } catch (error) {
    console.error('Error creating freight:', error);
    return NextResponse.json({ error: 'Failed to create freight' }, { status: 500 });
  }
}

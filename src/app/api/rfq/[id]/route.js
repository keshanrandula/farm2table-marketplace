import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Rfq from '@/models/Rfq';
import Order from '@/models/Order';
import Crop from '@/models/Crop';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const rfq = await Rfq.findById(id);

    if (!rfq) {
      return NextResponse.json({ success: false, error: 'RFQ not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rfq });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Submit a new bid for this RFQ (Farmer action)
export async function POST(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const { farmerId, farmerName, farmerPhone, pricePerUnit, deliveryDays, notes } = body;

    if (!farmerId || !pricePerUnit) {
      return NextResponse.json({ success: false, error: 'Missing required bid details' }, { status: 400 });
    }

    const rfq = await Rfq.findById(id);
    if (!rfq) {
      return NextResponse.json({ success: false, error: 'RFQ not found' }, { status: 404 });
    }

    if (rfq.status !== 'open') {
      return NextResponse.json({ success: false, error: 'This RFQ is no longer open for bids' }, { status: 400 });
    }

    const price = Number(pricePerUnit);
    const totalAmount = price * rfq.quantity;

    // Check if farmer already submitted a bid, update if so, or push new
    const existingIndex = rfq.bids.findIndex(b => b.farmerId.toString() === farmerId.toString());

    if (existingIndex > -1) {
      rfq.bids[existingIndex].pricePerUnit = price;
      rfq.bids[existingIndex].totalAmount = totalAmount;
      rfq.bids[existingIndex].deliveryDays = Number(deliveryDays || 1);
      rfq.bids[existingIndex].notes = notes || '';
      rfq.bids[existingIndex].farmerName = farmerName || rfq.bids[existingIndex].farmerName;
      rfq.bids[existingIndex].farmerPhone = farmerPhone || rfq.bids[existingIndex].farmerPhone;
    } else {
      rfq.bids.push({
        farmerId,
        farmerName: farmerName || 'Farmer Producer',
        farmerPhone: farmerPhone || '',
        pricePerUnit: price,
        totalAmount,
        deliveryDays: Number(deliveryDays || 1),
        notes: notes || '',
        status: 'pending'
      });
    }

    await rfq.save();

    return NextResponse.json({ success: true, data: rfq });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Hotel actions (accept bid or close RFQ)
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const { action, bidId } = body;

    const rfq = await Rfq.findById(id);
    if (!rfq) {
      return NextResponse.json({ success: false, error: 'RFQ not found' }, { status: 404 });
    }

    if (action === 'accept_bid') {
      const bid = rfq.bids.id(bidId);
      if (!bid) {
        return NextResponse.json({ success: false, error: 'Bid not found' }, { status: 404 });
      }

      // Mark bid as accepted, others rejected
      rfq.bids.forEach(b => {
        if (b._id.toString() === bidId.toString()) {
          b.status = 'accepted';
        } else {
          b.status = 'rejected';
        }
      });

      rfq.status = 'accepted';
      rfq.acceptedBid = bid;
      await rfq.save();

      // Find or create a dummy/real crop entry for the RFQ item if needed for Order Schema
      let cropObj = await Crop.findOne({ name: new RegExp(rfq.cropName, 'i') });
      let cropId = cropObj ? cropObj._id : rfq._id;

      // Automatically create order for the hotel
      const newOrder = await Order.create({
        buyerId: rfq.hotelId,
        items: [
          {
            cropId: cropId,
            name: `${rfq.cropName} (RFQ Bulk Order)`,
            quantity: rfq.quantity,
            price: bid.pricePerUnit
          }
        ],
        totalAmount: bid.totalAmount,
        deliveryFee: 1500, // standard bulk delivery fee
        buyerLocation: rfq.deliveryLocation,
        paymentMethod: 'bank_transfer',
        paymentStatus: 'pending',
        status: 'prepared'
      });

      return NextResponse.json({ success: true, data: { rfq, order: newOrder } });
    }

    if (action === 'close') {
      rfq.status = 'closed';
      await rfq.save();
      return NextResponse.json({ success: true, data: rfq });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

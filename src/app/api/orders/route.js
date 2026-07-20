import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Crop from '@/models/Crop';
import User from '@/models/User';

// GET orders (optionally filtered by farmerId, buyerId, or driverId)
export async function GET(request) {
  try {
    await connectDB();
    
    // Parse query parameters
    const { searchParams } = request.nextUrl;
    const farmerId = searchParams.get('farmerId');
    const buyerId = searchParams.get('buyerId');
    const driverId = searchParams.get('driverId');
    const unassigned = searchParams.get('unassigned');

    let orders;

    if (farmerId) {
      // Find all crops belonging to this farmer
      const farmerCrops = await Crop.find({ farmerId }, '_id');
      const cropIds = farmerCrops.map(c => c._id);

      // Find all orders that contain any items belonging to this farmer
      orders = await Order.find({
        'items.cropId': { $in: cropIds }
      })
      .populate('buyerId', 'name email')
      .populate({ path: 'items.cropId', populate: { path: 'farmerId', select: 'name email' } })
      .populate('driverId', 'name email')
      .sort({ createdAt: -1 });
    } else if (buyerId) {
      // Find all orders belonging to this buyer
      orders = await Order.find({ buyerId })
        .populate('buyerId', 'name email')
        .populate({ path: 'items.cropId', populate: { path: 'farmerId', select: 'name email' } })
        .populate('driverId', 'name email')
        .sort({ createdAt: -1 });
    } else if (unassigned === 'true') {
      // Find all prepared orders that have no driver assigned
      orders = await Order.find({
        status: 'prepared',
        $or: [{ driverId: null }, { driverId: { $exists: false } }]
      })
      .populate('buyerId', 'name email')
      .populate({ path: 'items.cropId', populate: { path: 'farmerId', select: 'name email' } })
      .sort({ createdAt: -1 });
    } else if (driverId) {
      // Find all orders assigned to this driver
      orders = await Order.find({ driverId })
        .populate('buyerId', 'name email')
        .populate({ path: 'items.cropId', populate: { path: 'farmerId', select: 'name email' } })
        .sort({ createdAt: -1 });
    } else {
      orders = await Order.find({})
        .populate('buyerId', 'name email')
        .populate({ path: 'items.cropId', populate: { path: 'farmerId', select: 'name email' } })
        .populate('driverId', 'name email')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST to create wholesale order
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { buyerId, items, totalAmount, discountAmount, deliveryFee, distance, buyerLocation, paymentMethod, paymentStatus, paymentReceipt } = body;

    if (!buyerId || !items || !items.length || totalAmount === undefined) {
      return NextResponse.json(
        { success: false, error: 'සියලුම තොරතුරු ඇතුළත් කරන්න / Missing required fields' },
        { status: 400 }
      );
    }

    const user = await User.findById(buyerId);
    const initialStatus = (user && user.role === 'customer') ? 'prepared' : 'pending';

    // Step 1: Pre-validation of stock quantities
    for (const item of items) {
      const crop = await Crop.findById(item.cropId);
      if (!crop) {
        return NextResponse.json(
          { success: false, error: `අස්වැන්න සොයාගත නොහැක / Crop not found: ${item.name}` },
          { status: 404 }
        );
      }
      if (crop.quantity < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `තොග ප්‍රමාණය ප්‍රමාණවත් නැත / Insufficient stock for ${item.name}. Available: ${crop.quantity} Kg, Requested: ${item.quantity} Kg`
          },
          { status: 400 }
        );
      }
    }

    // Step 2: Deduct stock from database
    for (const item of items) {
      const crop = await Crop.findById(item.cropId);
      crop.quantity = Math.max(0, crop.quantity - item.quantity);
      if (crop.quantity === 0) {
        crop.status = 'sold-out';
      }
      await crop.save();
    }

    // Step 3: Save the wholesale order record
    const newOrder = new Order({
      buyerId,
      items,
      totalAmount,
      discountAmount: discountAmount || 0,
      deliveryFee: deliveryFee || 0,
      distance: distance || 0,
      buyerLocation: buyerLocation || 'Colombo',
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentStatus || 'pending',
      paymentReceipt: paymentReceipt || '',
      status: initialStatus
    });
    
    await newOrder.save();

    return NextResponse.json(
      {
        success: true,
        message: 'තොග ඇණවුම සාර්ථකව සිදු කරන ලදී / Wholesale order placed successfully',
        data: newOrder
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

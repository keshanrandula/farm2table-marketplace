import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    
    // Await params to support Next.js dynamic routing conventions
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const body = await request.json();
    const { status, driverId, paymentStatus } = body;

    if (!status && driverId === undefined && !paymentStatus) {
      return NextResponse.json(
        { success: false, error: 'යාවත්කාලීන කිරීමට තොරතුරු අවශ්‍ය වේ / Update data is required' },
        { status: 400 }
      );
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (driverId !== undefined) updateFields.driverId = driverId === "null" || driverId === null ? null : driverId;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'ඇණවුම සොයාගත නොහැක / Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ඇණවුමේ තත්ත්වය යාවත්කාලීන කරන ලදී / Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

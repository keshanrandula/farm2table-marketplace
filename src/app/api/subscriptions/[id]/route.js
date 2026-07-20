import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subscription from '@/models/Subscription';

// PATCH update subscription status
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['active', 'paused', 'cancelled'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const updatedSub = await Subscription.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedSub) {
      return NextResponse.json({ success: false, error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedSub });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE cancel/delete subscription
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const deletedSub = await Subscription.findByIdAndDelete(id);

    if (!deletedSub) {
      return NextResponse.json({ success: false, error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

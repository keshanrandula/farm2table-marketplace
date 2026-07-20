import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Message from '@/models/Message';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const userId1 = searchParams.get('userId1');
    const userId2 = searchParams.get('userId2');

    if (!userId1 || !userId2) {
      return NextResponse.json(
        { success: false, error: 'පරිශීලක හැඳුනුම්පත් අවශ්‍ය වේ / User IDs are required' },
        { status: 400 }
      );
    }

    // Find all messages between userId1 and userId2, sorted by creation date
    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages sent by userId2 to userId1 as read
    await Message.updateMany(
      { senderId: userId2, receiverId: userId1, read: false },
      { read: true }
    );

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { senderId, receiverId, text, cropId } = body;

    if (!senderId || !receiverId || !text) {
      return NextResponse.json(
        { success: false, error: 'පණිවිඩය සම්පූර්ණ කරන්න / Text, sender, and receiver are required' },
        { status: 400 }
      );
    }

    const message = await Message.create({
      senderId,
      receiverId,
      text,
      cropId: cropId || null
    });

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

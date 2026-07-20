import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'පරිශීලක හැඳුනුම්පත අවශ්‍ය වේ / User ID is required' },
        { status: 400 }
      );
    }

    // Find all messages involving the user
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    const threadsMap = {};

    for (const msg of messages) {
      const otherUser = msg.senderId.toString() === userId.toString() ? msg.receiverId : msg.senderId;
      const otherUserIdStr = otherUser.toString();

      if (!threadsMap[otherUserIdStr]) {
        threadsMap[otherUserIdStr] = {
          otherUserId: otherUserIdStr,
          lastMessage: msg.text,
          updatedAt: msg.createdAt,
          unreadCount: 0
        };
      }

      // Count unread messages received by our logged-in user
      if (msg.receiverId.toString() === userId.toString() && !msg.read) {
        threadsMap[otherUserIdStr].unreadCount++;
      }
    }

    const threadsArray = Object.values(threadsMap);

    // Populate user profiles
    const populatedThreads = await Promise.all(
      threadsArray.map(async (thread) => {
        const profile = await User.findById(thread.otherUserId).select('name email role');
        return {
          ...thread,
          profile
        };
      })
    );

    // Sort by last message date descending
    populatedThreads.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Filter out threads with invalid/deleted profiles
    const validThreads = populatedThreads.filter(t => t.profile !== null);

    return NextResponse.json({ success: true, data: validThreads });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

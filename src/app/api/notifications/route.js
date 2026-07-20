import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role') || 'all';

    let filter = {
      $or: [
        { role: 'all' },
        { role: role }
      ]
    };

    if (userId) {
      filter.$or.push({ userId: userId });
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(20);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      userId,
      role,
      title,
      titleSi,
      titleTa,
      message,
      messageSi,
      messageTa,
      type,
      link
    } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'Title and message are required' }, { status: 400 });
    }

    const newNotification = await Notification.create({
      userId: userId || null,
      role: role || 'all',
      title,
      titleSi: titleSi || title,
      titleTa: titleTa || title,
      message,
      messageSi: messageSi || message,
      messageTa: messageTa || message,
      type: type || 'order',
      link: link || '',
      isRead: false
    });

    return NextResponse.json({ success: true, data: newNotification }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { notificationId, markAllRead, userId } = body;

    if (markAllRead && userId) {
      await Notification.updateMany(
        { $or: [{ userId }, { role: 'all' }] },
        { isRead: true }
      );
      return NextResponse.json({ success: true, message: 'All marked as read' });
    }

    if (notificationId) {
      const notification = await Notification.findById(notificationId);
      if (notification) {
        notification.isRead = true;
        await notification.save();
      }
      return NextResponse.json({ success: true, data: notification });
    }

    return NextResponse.json({ success: false, error: 'Invalid patch payload' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

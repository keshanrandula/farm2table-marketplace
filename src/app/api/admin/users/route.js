import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Crop from '@/models/Crop';

export async function GET(request) {
  try {
    await connectDB();
    const users = await User.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
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

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, error: 'පරිශීලකයා සොයාගත නොහැක / User not found' },
        { status: 404 }
      );
    }

    // Delete all crops associated with this user
    await Crop.deleteMany({ farmerId: userId });

    return NextResponse.json({
      success: true,
      message: 'පරිශීලකයා සාර්ථකව ඉවත් කරන ලදී / User deleted successfully'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

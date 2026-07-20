import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Crop from '@/models/Crop';

export async function GET(request) {
  try {
    await connectDB();
    const crops = await Crop.find({}).populate('farmerId', 'name email').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: crops });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const cropId = searchParams.get('cropId');

    if (!cropId) {
      return NextResponse.json(
        { success: false, error: 'අස්වනු හැඳුනුම්පත අවශ්‍ය වේ / Crop ID is required' },
        { status: 400 }
      );
    }

    const deletedCrop = await Crop.findByIdAndDelete(cropId);

    if (!deletedCrop) {
      return NextResponse.json(
        { success: false, error: 'අස්වැන්න සොයාගත නොහැක / Crop not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'අස්වැන්න සාර්ථකව ඉවත් කරන ලදී / Crop deleted successfully'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

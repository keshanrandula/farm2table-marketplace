import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Crop from '@/models/Crop';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const crop = await Crop.findById(id).populate('farmerId', 'name email');
    
    if (!crop) {
      return NextResponse.json(
        { success: false, error: 'අස්වැන්න සොයාගත නොහැක / Crop not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: crop });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

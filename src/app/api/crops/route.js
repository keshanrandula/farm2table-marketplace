import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Crop from '@/models/Crop';

// සියලුම ලබාගත හැකි අස්වනු විස්තර ලබාගැනීම (GET Request)
export async function GET(request) {
  try {
    await connectDB();
    
    // Parse query parameters
    const { searchParams } = request.nextUrl;
    const location = searchParams.get('location');
    const farmerId = searchParams.get('farmerId');

    let filter = {};
    
    if (farmerId) {
      filter.farmerId = farmerId;
    } else {
      filter.status = 'available';
      // Apply location filter if provided and not "all"
      if (location && location.toLowerCase() !== 'all') {
        filter.location = { $regex: new RegExp(location, 'i') };
      }
    }

    const crops = await Crop.find(filter).populate('farmerId', 'name email'); 
    return NextResponse.json({ success: true, data: crops }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// නව අස්වැන්නක් ඇතුළත් කිරීම (POST Request)
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { farmerId, name, price, quantity, location, address, image, status, grade, organicStatus } = body;

    // Field Validation
    if (!farmerId || !name || price === undefined || quantity === undefined || !location) {
      return NextResponse.json(
        { success: false, error: 'සියලුම අත්‍යවශ්‍ය ක්ෂේත්‍ර පුරවන්න / Please fill in all required fields' },
        { status: 400 }
      );
    }

    const newCrop = new Crop({
      farmerId,
      name,
      price: Number(price),
      quantity: Number(quantity),
      location,
      address: address || '',
      image: image || '',
      status: status || 'available',
      grade: grade || 'N/A',
      organicStatus: organicStatus || 'conventional'
    });

    await newCrop.save();

    return NextResponse.json(
      { success: true, message: 'අස්වැන්න සාර්ථකව ඇතුළත් කරන ලදී / Crop added successfully', data: newCrop },
      { status: 201 }
    );
  } catch (error) {
    console.error("Crops API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
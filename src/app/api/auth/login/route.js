import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'විද්‍යුත් තැපෑල සහ මුරපදය අවශ්‍ය වේ / Email and password are required' },
        { status: 400 }
      );
    }

    // Normalizing email comparison to handle cases
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'පරිශීලකයා සොයාගත නොහැක / User not found' },
        { status: 404 }
      );
    }

    // Compare passwords
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.warn("Bcrypt comparison failed, falling back to direct string check", bcryptError);
    }

    // Direct match fallback for existing users registered without bcrypt hashing
    if (!isMatch && password === user.password) {
      isMatch = true;
    }

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'මුරපදය වැරදියි / Incorrect password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

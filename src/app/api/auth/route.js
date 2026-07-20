import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, role, password, action } = body;

    if (action === 'login') {
      // Login Logic
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'පරිශීලකයා සොයාගත නොහැක / User not found' },
          { status: 404 }
        );
      }
      // Simple text match (in production we would use bcrypt hashing)
      if (user.password !== password) {
        return NextResponse.json(
          { success: false, error: 'මුරපදය වැරදියි / Incorrect password' },
          { status: 401 }
        );
      }
      return NextResponse.json({
        success: true,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } else {
      // Registration Logic
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'මෙම ඊමේල් ලිපිනය දැනටමත් ලියාපදිංචි කර ඇත / Email already registered' },
          { status: 400 }
        );
      }

      const newUser = new User({
        name,
        email,
        role: role || 'customer',
        password
      });

      await newUser.save();
      return NextResponse.json(
        { success: true, user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } },
        { status: 201 }
      );
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

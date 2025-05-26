import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { updateUser, getUserById } from '../../../../services/userService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

// GET /api/user/profile - Get current user's profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT /api/user/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, department, departmentId, phone, bio, jobTitle } = body;

    // Security: Role changes are not allowed through user profile updates
    // Only admins can change user roles through the team management API

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await getUserById(session.user.id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      email: email.trim(),
    };

    // Add optional fields if provided
    if (department !== undefined) updateData.department = department;
    if (departmentId !== undefined) updateData.departmentId = departmentId;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;

    // Update user in Firestore
    const updatedUser = await updateUser(session.user.id, updateData);

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/profile - Partially update current user's profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();

    // Security: Role changes are not allowed through user profile updates
    // Only admins can change user roles through the team management API

    // Check if user exists
    const existingUser = await getUserById(session.user.id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate email if provided
    if (body.email !== undefined && (!body.email.trim() || !body.email.includes('@'))) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Validate name if provided
    if (body.name !== undefined && !body.name.trim()) {
      return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    }

    // Prepare update data (only include fields that are provided)
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.email !== undefined) updateData.email = body.email.trim();
    if (body.department !== undefined) updateData.department = body.department;
    if (body.departmentId !== undefined) updateData.departmentId = body.departmentId;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.jobTitle !== undefined) updateData.jobTitle = body.jobTitle;

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No changes to update' });
    }

    // Update user in Firestore
    const updatedUser = await updateUser(session.user.id, updateData);

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

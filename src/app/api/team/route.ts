import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  getUserById
} from '../../../services/userService';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

// Function to update all projects when a member name changes
async function updateProjectsWithNewMemberName(oldName: string, newName: string) {
  try {
    console.log(`Updating projects: changing "${oldName}" to "${newName}"`);

    // Query all projects where opdFocal matches the old name
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('opdFocal', '==', oldName));
    const querySnapshot = await getDocs(q);

    const updatePromises: Promise<void>[] = [];

    querySnapshot.forEach((docSnapshot) => {
      const projectRef = doc(db, 'projects', docSnapshot.id);
      updatePromises.push(
        updateDoc(projectRef, {
          opdFocal: newName,
          updatedAt: new Date()
        })
      );
    });

    await Promise.all(updatePromises);
    console.log(`Updated ${updatePromises.length} projects with new member name`);

    return updatePromises.length;
  } catch (error) {
    console.error('Error updating projects with new member name:', error);
    throw error;
  }
}

// Get all team members
export async function GET() {
  try {
    const users = await getAllUsers();

    // Remove password from response
    const safeUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    // Get project counts for each user
    const projectsCollection = collection(db, 'projects');
    const usersWithProjects = await Promise.all(
      safeUsers.map(async (user) => {
        try {
          // Query projects where opdFocal matches user name
          const projectsQuery = query(
            projectsCollection,
            where('opdFocal', '==', user.name)
          );
          const projectsSnapshot = await getDocs(projectsQuery);

          // Return user with projects count
          return {
            ...user,
            projectCount: projectsSnapshot.size,
            projects: projectsSnapshot.docs.map(doc => ({
              id: doc.id,
              title: doc.data().projectTitle,
              status: doc.data().status,
              percentage: doc.data().percentage
            }))
          };
        } catch (error) {
          console.error(`Error fetching projects for user ${user.id}:`, error);
          return {
            ...user,
            projectCount: 0,
            projects: []
          };
        }
      })
    );

    return NextResponse.json(usersWithProjects);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

// Create a new team member
export async function POST(request: Request) {
  try {
    // For now, skip authentication check since we're transitioning
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.role || session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { name, email, password, role, department, departmentId } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Firebase
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role: role || 'USER',
      department: department || '',
      departmentId: departmentId || null
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
  }
}

// Update a team member
export async function PUT(request: Request) {
  try {
    // For now, skip authentication check since we're transitioning
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.role || session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { id, name, email, role, department, departmentId, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // Get the current user data to check if name is changing
    const currentUser = await getUserById(id);
    const oldName = currentUser?.name;

    const updateData: any = {
      name,
      email,
      role,
      department: department || '',
      departmentId: departmentId || null
    };

    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await updateUser(id, updateData);

    // If the name changed, update all projects with the old name
    if (oldName && oldName !== name) {
      try {
        const updatedProjectsCount = await updateProjectsWithNewMemberName(oldName, name);
        console.log(`Successfully updated ${updatedProjectsCount} projects with new member name`);
      } catch (error) {
        console.error('Error updating projects with new member name:', error);
        // Don't fail the user update if project sync fails
      }
    }

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
  }
}

// Delete a team member
export async function DELETE(request: Request) {
  try {
    // For now, skip authentication check since we're transitioning
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.role || session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    await deleteUser(id);

    return NextResponse.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
  }
}
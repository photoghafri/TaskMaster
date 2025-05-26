import { NextRequest, NextResponse } from 'next/server';
import {
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  departmentNameExists
} from '@/services/departmentService';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// GET /api/departments/[id] - Get department by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const department = await getDepartmentById(id);

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Get users in department
    const usersQuery = query(collection(db, 'users'), where('departmentId', '==', id));
    const usersSnapshot = await getDocs(usersQuery);
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role
      };
    });

    // Get projects in department
    const projectsQuery = query(collection(db, 'projects'), where('departmentId', '==', id));
    const projectsSnapshot = await getDocs(projectsQuery);
    const projects = projectsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        projectTitle: data.projectTitle,
        status: data.status,
        budget: data.budget,
        percentage: data.percentage
      };
    });

    // Return department with related data
    return NextResponse.json({
      ...department,
      users,
      projects
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department' },
      { status: 500 }
    );
  }
}

// PATCH /api/departments/[id] - Update department by ID
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Validate required fields
    if (body.name !== undefined && body.name.trim() === '') {
      return NextResponse.json(
        { error: 'Department name cannot be empty' },
        { status: 400 }
      );
    }

    // Check if department exists
    const existingDepartment = await getDepartmentById(id);
    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Check if another department with the same name exists
    if (body.name && body.name !== existingDepartment.name) {
      const exists = await departmentNameExists(body.name, id);
      if (exists) {
        return NextResponse.json(
          { error: 'Another department with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Update the department
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.budget !== undefined) updateData.budget = parseFloat(body.budget);

    const department = await updateDepartment(id, updateData);

    return NextResponse.json(department);
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

// DELETE /api/departments/[id] - Delete department by ID
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await deleteDepartment(id);

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Error deleting department:', error);

    // Check for specific error messages
    if (error.message?.includes('associated users') || error.message?.includes('associated projects')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    );
  }
}
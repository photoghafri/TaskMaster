import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllDepartments, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment,
  departmentNameExists
} from '@/services/departmentService';

// GET /api/departments - Get all departments
export async function GET() {
  try {
    const departments = await getAllDepartments();
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

// POST /api/departments - Create a new department
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }

    // Check if department with same name already exists
    const exists = await departmentNameExists(body.name);
    if (exists) {
      return NextResponse.json(
        { error: 'Department with this name already exists' },
        { status: 400 }
      );
    }

    // Create the department
    const department = await createDepartment({
      name: body.name,
      description: body.description || null,
      budget: body.budget ? parseFloat(body.budget) : null,
    });
    
    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    );
  }
}

// PUT /api/departments - Update a department
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Department ID is required' },
        { status: 400 }
      );
    }
    
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }

    // Check if another department with the same name exists
    const exists = await departmentNameExists(body.name, body.id);
    if (exists) {
      return NextResponse.json(
        { error: 'Another department with this name already exists' },
        { status: 400 }
      );
    }
    
    const department = await updateDepartment(body.id, {
      name: body.name,
      description: body.description || null,
      budget: body.budget ? parseFloat(body.budget) : null,
    });
    
    return NextResponse.json(department);
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

// DELETE /api/departments?id={id} - Delete a department
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Department ID is required' },
        { status: 400 }
      );
    }
    
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
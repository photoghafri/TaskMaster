import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, updateProject, deleteProject } from '../../../../services/projectService';
import { logStatusChange, logSubStatusChange, logProjectUpdate } from '../../../../services/projectLogService';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

// GET /api/projects/[id] - Get a specific project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract project ID using destructuring
    const { id } = await params;
    const data = await request.json();
    const session = await getServerSession(authOptions);

    // Get the existing project for comparison
    const existingProject = await getProjectById(id);
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Validate status if it's being changed
    if (data.status && data.status !== existingProject.status) {
      const validStatuses = ['Possible', 'Scoping', 'Procurement', 'Execution', 'Completed', 'Closed'];
      if (!validStatuses.includes(data.status)) {
        return NextResponse.json(
          { error: 'Invalid status value', details: `Status must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Convert year to number if it's a string
    if (typeof data.year === 'string') {
      data.year = parseInt(data.year, 10);
    }

    // Convert savings to number if provided as string
    if (data.savingsOMR && typeof data.savingsOMR === 'string') {
      data.savingsOMR = parseFloat(data.savingsOMR);
    }

    if (data.savingsPercentage && typeof data.savingsPercentage === 'string') {
      data.savingsPercentage = parseFloat(data.savingsPercentage);
    }

    if (data.budget && typeof data.budget === 'string') {
      data.budget = parseFloat(data.budget);
    }

    if (data.awardAmount && typeof data.awardAmount === 'string') {
      data.awardAmount = parseFloat(data.awardAmount);
    }

    if (data.percentage && typeof data.percentage === 'string') {
      data.percentage = parseInt(data.percentage, 10);
    }

    if (data.duration && typeof data.duration === 'string') {
      data.duration = parseInt(data.duration, 10);
    }

    // Update the project
    console.log('Updating project with data:', JSON.stringify(data, null, 2));
    const updatedProject = await updateProject(id, data);

    // Create logs for changes if user is authenticated
    if (session?.user) {
      const userId = session.user.id || '';
      const userName = session.user.name || '';

      // Log status change with note
      if (existingProject.status !== data.status && data.status) {
        await logStatusChange(
          id,
          existingProject.status,
          data.status,
          data.statusChangeNote || '',
          userId,
          userName
        );
      }

      // Log sub-status change
      if (existingProject.subStatus !== data.subStatus && data.subStatus !== undefined) {
        await logSubStatusChange(
          id,
          existingProject.subStatus || '',
          data.subStatus || '',
          userId,
          userName
        );
      }

      // Log other significant changes
      const changes: Record<string, { from: any; to: any }> = {};
      const significantFields = [
        'projectTitle', 'department', 'percentage', 'budget',
        'awardAmount', 'opdFocal', 'completionDate', 'startDate'
      ];

      significantFields.forEach(field => {
        if (data[field] !== undefined && existingProject[field as keyof typeof existingProject] !== data[field]) {
          changes[field] = {
            from: existingProject[field as keyof typeof existingProject],
            to: data[field]
          };
        }
      });

      // Create a general update log if there are other changes
      if (Object.keys(changes).length > 0) {
        const descriptions: string[] = [];
        Object.entries(changes).forEach(([field, change]) => {
          descriptions.push(`${field}: "${change.from}" → "${change.to}"`);
        });

        await logProjectUpdate(
          id,
          `Project updated: ${descriptions.join(', ')}`,
          changes,
          userId,
          userName
        );
      }
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteProject(id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getProjectLogs, createProjectLog, deleteProjectLog, deleteAllProjectLogs } from '../../../../../services/projectLogService';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';

// GET /api/projects/[id]/logs - Get logs for a specific project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the project ID safely
    const { id: projectId } = await params;
    console.log(`Fetching logs for project ID: ${projectId}`);

    const logs = await getProjectLogs(projectId);
    console.log(`Found ${logs.length} logs for project ${projectId}`);

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching project logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project logs' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/logs - Create a new log entry for a project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the project ID safely
    const { id: projectId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();

    const logData = {
      projectId,
      action: data.action,
      description: data.description,
      changes: data.changes || {},
      note: data.note || '',
      createdBy: session.user.id || '',
      createdByName: session.user.name || ''
    };

    const log = await createProjectLog(logData);

    return NextResponse.json(log);
  } catch (error) {
    console.error('Error creating project log:', error);
    return NextResponse.json(
      { error: 'Failed to create project log' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/logs - Delete all logs for a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check for authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be logged in to delete logs.' },
        { status: 401 }
      );
    }

    // Get the project ID safely
    const { id: projectId } = await params;

    // Check if we're deleting a specific log or all logs
    const { searchParams } = new URL(request.url);
    const logId = searchParams.get('logId');

    if (logId) {
      // Delete a specific log
      await deleteProjectLog(logId);
      return NextResponse.json({
        success: true,
        message: `Log ${logId} deleted successfully`
      });
    } else {
      // Delete all logs for the project
      const deletedCount = await deleteAllProjectLogs(projectId);
      return NextResponse.json({
        success: true,
        message: `${deletedCount} logs deleted for project ${projectId}`
      });
    }
  } catch (error) {
    console.error('Error deleting project logs:', error);
    return NextResponse.json(
      { error: 'Failed to delete project logs' },
      { status: 500 }
    );
  }
}
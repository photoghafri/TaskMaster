import { NextRequest, NextResponse } from 'next/server';
import { archiveProject, unarchiveProject } from '@/services/projectService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/projects/[id]/archive - Archive a project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const archivedProject = await archiveProject(id, session.user.id);

    return NextResponse.json(archivedProject);
  } catch (error) {
    console.error('Error archiving project:', error);
    return NextResponse.json(
      { error: 'Failed to archive project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/archive - Unarchive a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const unarchivedProject = await unarchiveProject(id);

    return NextResponse.json(unarchivedProject);
  } catch (error) {
    console.error('Error unarchiving project:', error);
    return NextResponse.json(
      { error: 'Failed to unarchive project' },
      { status: 500 }
    );
  }
}

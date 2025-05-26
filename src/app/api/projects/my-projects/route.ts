import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's name from session
    const userName = session.user.name;

    if (!userName) {
      return NextResponse.json({ error: 'User name not found' }, { status: 400 });
    }

    // Query projects where the user is the OPD Focal
    // Use simple query to avoid index requirements
    const projectsRef = collection(db, 'projects');
    const userProjectsQuery = query(
      projectsRef,
      where('opdFocal', '==', userName)
    );

    const querySnapshot = await getDocs(userProjectsQuery);

    // Filter out archived projects and sort in memory
    const projects = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter((project: any) => !project.isArchived)
      .sort((a: any, b: any) => {
        // Sort by createdAt descending
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching my projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

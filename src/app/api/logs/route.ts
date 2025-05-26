import { NextRequest, NextResponse } from 'next/server';
import { getAllProjectLogs } from '@/services/projectLogService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/logs - Get all project logs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only authenticated users can access logs
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get all project logs
    const logs = await getAllProjectLogs();
    
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching all project logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project logs' },
      { status: 500 }
    );
  }
} 
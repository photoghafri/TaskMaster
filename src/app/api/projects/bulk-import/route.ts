import { NextRequest, NextResponse } from 'next/server';
import { createProject } from '../../../../services/projectService';
import { logProjectCreation } from '../../../../services/projectLogService';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

// POST /api/projects/bulk-import - Import multiple projects at once
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be logged in to import projects.' },
        { status: 401 }
      );
    }

    // Get projects data from request
    const { projects } = await request.json();

    if (!Array.isArray(projects) || projects.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Expected an array of projects.' },
        { status: 400 }
      );
    }

    // Process each project
    const results = [];
    const errors = [];

    for (let i = 0; i < projects.length; i++) {
      try {
        const projectData = projects[i];

        // Basic validation
        if (!projectData.projectTitle) {
          errors.push({ index: i, error: 'Project title is required', data: projectData });
          continue;
        }

        // Convert numeric values if they come as strings and set defaults
        const processedData = {
          ...projectData,
          year: typeof projectData.year === 'string' ? parseInt(projectData.year, 10) : projectData.year || new Date().getFullYear(),
          percentage: typeof projectData.percentage === 'string' ? parseInt(projectData.percentage, 10) : projectData.percentage || 0,
          budget: projectData.budget ? parseFloat(String(projectData.budget)) : 0,
          awardAmount: projectData.awardAmount ? parseFloat(String(projectData.awardAmount)) : 0,
          savingsOMR: projectData.savingsOMR ? parseFloat(String(projectData.savingsOMR)) : 0,
          savingsPercentage: projectData.savingsPercentage ? parseFloat(String(projectData.savingsPercentage)) : 0,
          duration: projectData.duration ? parseInt(String(projectData.duration), 10) : 0,
          status: projectData.status || 'Possible',
          subStatus: projectData.subStatus || '',
          opdFocal: projectData.opdFocal || '',
          capexOpex: projectData.capexOpex || 'CAPEX',
          department: projectData.department || '',
          area: projectData.area || '',
          pr: projectData.pr || '',
          pmoNumber: projectData.pmoNumber || '',
          startDate: projectData.startDate || null,
          completionDate: projectData.completionDate || null,
          note: projectData.note || '',
          drivers: projectData.drivers || '',
          type: projectData.type || 'Planned',
          createdBy: session.user.id || '',
        };

        // Create project in database
        const project = await createProject(processedData);

        // Log project creation
        await logProjectCreation(
          project.id,
          project.projectTitle,
          session.user.id || '',
          session.user.name || ''
        );

        // Add to successful results
        results.push({
          id: project.id,
          projectTitle: project.projectTitle,
          status: 'success'
        });

      } catch (error) {
        console.error(`Error importing project at index ${i}:`, error);
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: projects[i]
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error during bulk import:', error);
    return NextResponse.json(
      { error: 'Failed to import projects', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  orderBy
} from 'firebase/firestore';
import { formatDate } from '@/utils/dateUtils';

// Define our own toJsDate function to prevent dependency issues
function toJsDate(date: any): Date | null {
  if (!date) return null;

  try {
    // Already a Date object
    if (date instanceof Date) {
      return date;
    }

    // String date (ISO format or other string representation)
    if (typeof date === 'string') {
      // Handle ISO dates
      if (date.match(/^\d{4}-\d{2}-\d{2}/) || date.includes('T00:00:00')) {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }

      // Try to parse as a date anyway
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    // Numeric timestamp (milliseconds since epoch)
    if (typeof date === 'number') {
      return new Date(date);
    }

    // Firebase Timestamp with toDate() method
    if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
      return date.toDate();
    }

    // Firebase Timestamp-like object with seconds and nanoseconds
    if (date && typeof date === 'object' && 'seconds' in date) {
      return new Date(date.seconds * 1000);
    }

    // Stringified object that might contain a timestamp
    if (typeof date === 'string' && (date.includes('"seconds"') || date.includes('"nanoseconds"'))) {
      try {
        const parsed = JSON.parse(date);
        if (parsed && typeof parsed === 'object' && 'seconds' in parsed) {
          return new Date(parsed.seconds * 1000);
        }
      } catch (e) {}
    }
  } catch (error) {
    console.error('Error converting to JS Date:', error);
  }

  return null;
}

// Project type definition
export interface Project {
  id: string;
  projectTitle: string;
  department: string;
  status: string;
  subStatus?: string;
  completionDate?: Date | string | null;
  startDate?: Date | string | null;
  percentage: number;
  budget?: number;
  awardAmount?: number;
  awardedCompany?: string;
  savingsOMR?: number;
  savingsPercentage?: number;
  drivers: string;
  type: string;
  opdFocal: string;
  area: string;
  capexOpex: string;
  year: number;
  briefStatus?: string;
  pr?: string;
  duration?: number;
  poNumber?: string;
  pmoNumber?: string;
  column1?: string;
  dateOfReceiveFinalDoc?: Date | string | null;
  quarterOfYear?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;
  departmentId?: string;
  statusChangeNote?: string;
  isArchived?: boolean;
  archivedAt?: Date | string | null;
  archivedBy?: string;
  statusChangeDate?: Date | string | null;
  note?: string;
}

// Convert Firestore document to Project object
const projectConverter = {
  fromFirestore(snapshot: QueryDocumentSnapshot): Project {
    const data = snapshot.data();

    // Handle date conversions
    const createdAt = toJsDate(data.createdAt) || new Date();
    const updatedAt = toJsDate(data.updatedAt) || new Date();
    const startDate = data.startDate ? toJsDate(data.startDate) : null;
    const completionDate = data.completionDate ? toJsDate(data.completionDate) : null;
    const dateOfReceiveFinalDoc = data.dateOfReceiveFinalDoc ? toJsDate(data.dateOfReceiveFinalDoc) : null;
    const statusChangeDate = data.statusChangeDate ? toJsDate(data.statusChangeDate) : null;

    // Handle archived date
    let archivedAt = null;
    if (data.archivedAt) {
      if (data.archivedAt.toDate) {
        archivedAt = data.archivedAt.toDate();
      } else if (typeof data.archivedAt === 'string') {
        archivedAt = new Date(data.archivedAt);
      } else {
        archivedAt = data.archivedAt;
      }
    }

    return {
      id: snapshot.id,
      projectTitle: data.projectTitle || '',
      department: data.department || '',
      status: data.status || 'Possible',
      subStatus: data.subStatus || '',
      completionDate,
      startDate,
      percentage: data.percentage || 0,
      budget: data.budget || 0,
      awardAmount: data.awardAmount || 0,
      awardedCompany: data.awardedCompany || '',
      savingsOMR: data.savingsOMR || 0,
      savingsPercentage: data.savingsPercentage || 0,
      drivers: data.drivers || '',
      type: data.type || '',
      opdFocal: data.opdFocal || '',
      area: data.area || '',
      capexOpex: data.capexOpex || 'CAPEX',
      year: data.year || new Date().getFullYear(),
      briefStatus: data.briefStatus || '',
      pr: data.pr || '',
      duration: data.duration || 0,
      poNumber: data.poNumber || '',
      pmoNumber: data.pmoNumber || '',
      column1: data.column1 || '',
      dateOfReceiveFinalDoc,
      quarterOfYear: data.quarterOfYear || 'Q1',
      createdAt,
      updatedAt,
      createdBy: data.createdBy || '',
      departmentId: data.departmentId || '',
      statusChangeNote: data.statusChangeNote || '',
      statusChangeDate,
      note: data.note || '',
      isArchived: data.isArchived || false,
      archivedAt,
      archivedBy: data.archivedBy || ''
    };
  },
  toFirestore(project: Partial<Project>): DocumentData {
    const data: DocumentData = {
      ...project,
      updatedAt: serverTimestamp()
    };

    // Remove id field if present
    delete data.id;

    return data;
  }
};

// Collection reference
const projectsCollection = collection(db, 'projects');

// Get all projects
export async function getAllProjects(): Promise<Project[]> {
  try {
    const q = query(projectsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => projectConverter.fromFirestore(doc));
  } catch (error) {
    console.error('Error getting projects:', error);
    throw error;
  }
}

// Get project by ID
export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const docRef = doc(db, 'projects', id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return projectConverter.fromFirestore(snapshot as QueryDocumentSnapshot);
  } catch (error) {
    console.error(`Error getting project ${id}:`, error);
    throw error;
  }
}

// Get projects by department
export async function getProjectsByDepartment(department: string): Promise<Project[]> {
  try {
    const q = query(projectsCollection, where('department', '==', department));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => projectConverter.fromFirestore(doc));
  } catch (error) {
    console.error(`Error getting projects for department ${department}:`, error);
    throw error;
  }
}

// Get projects by status
export async function getProjectsByStatus(status: string): Promise<Project[]> {
  try {
    const q = query(projectsCollection, where('status', '==', status));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => projectConverter.fromFirestore(doc));
  } catch (error) {
    console.error(`Error getting projects with status ${status}:`, error);
    throw error;
  }
}

// Create new project
export async function createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  try {
    const data = {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(projectsCollection, data);
    const newDoc = await getDoc(docRef);

    return projectConverter.fromFirestore(newDoc as QueryDocumentSnapshot);
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

// Update project
export async function updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
  try {
    console.log(`Updating project ${id} with data:`, JSON.stringify(projectData, null, 2));
    const docRef = doc(db, 'projects', id);

    // Validate that document exists before updating
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`Cannot update: Project with ID ${id} not found`);
    }

    // Clean the data to prevent Invalid DocumentReference errors
    const cleanedData: Partial<Project> = { ...projectData };

    // Add updatedAt timestamp
    const data = projectConverter.toFirestore(cleanedData);
    console.log('Converted data for Firestore:', JSON.stringify(data, null, 2));

    await updateDoc(docRef, data);
    console.log(`Project ${id} updated successfully`);

    // Get updated document
    const updatedDoc = await getDoc(docRef);

    if (!updatedDoc.exists()) {
      throw new Error(`Project with ID ${id} not found after update`);
    }

    return projectConverter.fromFirestore(updatedDoc as QueryDocumentSnapshot);
  } catch (error) {
    console.error(`Error updating project ${id}:`, error);
    throw error;
  }
}

// Delete project
export async function deleteProject(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'projects', id));
  } catch (error) {
    console.error(`Error deleting project ${id}:`, error);
    throw error;
  }
}

// Search projects
export async function searchProjects(searchTerm: string): Promise<Project[]> {
  try {
    // For now, we'll get all projects and filter client-side
    // Firebase doesn't support full-text search natively
    const allProjects = await getAllProjects();

    const lowerSearchTerm = searchTerm.toLowerCase();

    return allProjects.filter(project =>
      project.projectTitle.toLowerCase().includes(lowerSearchTerm) ||
      project.department.toLowerCase().includes(lowerSearchTerm) ||
      project.opdFocal.toLowerCase().includes(lowerSearchTerm) ||
      project.area.toLowerCase().includes(lowerSearchTerm) ||
      project.status.toLowerCase().includes(lowerSearchTerm)
    );
  } catch (error) {
    console.error('Error searching projects:', error);
    throw error;
  }
}

// Archive project
export async function archiveProject(id: string, userId: string): Promise<Project> {
  try {
    const updateData = {
      isArchived: true,
      archivedAt: serverTimestamp(),
      archivedBy: userId
    };

    return await updateProject(id, updateData);
  } catch (error) {
    console.error(`Error archiving project ${id}:`, error);
    throw error;
  }
}

// Unarchive project
export async function unarchiveProject(id: string): Promise<Project> {
  try {
    const updateData = {
      isArchived: false,
      archivedAt: null,
      archivedBy: ''
    };

    return await updateProject(id, updateData);
  } catch (error) {
    console.error(`Error unarchiving project ${id}:`, error);
    throw error;
  }
}

// Get active projects (non-archived)
export async function getActiveProjects(): Promise<Project[]> {
  try {
    const allProjects = await getAllProjects();
    return allProjects.filter(project => !project.isArchived);
  } catch (error) {
    console.error('Error getting active projects:', error);
    throw error;
  }
}

// Get archived projects
export async function getArchivedProjects(): Promise<Project[]> {
  try {
    const allProjects = await getAllProjects();
    return allProjects.filter(project => project.isArchived);
  } catch (error) {
    console.error('Error getting archived projects:', error);
    throw error;
  }
}

// Get projects by user (OPD Focal)
export async function getProjectsByUser(userEmail: string): Promise<Project[]> {
  try {
    const allProjects = await getAllProjects();
    return allProjects.filter(project =>
      project.opdFocal.toLowerCase() === userEmail.toLowerCase() ||
      project.createdBy === userEmail
    );
  } catch (error) {
    console.error('Error getting projects by user:', error);
    throw error;
  }
}
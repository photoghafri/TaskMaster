import { db } from '../lib/firebase';
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
  QueryDocumentSnapshot
} from 'firebase/firestore';

// Department type definition
export interface Department {
  id: string;
  name: string;
  description: string | null;
  budget: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// Department with stats (for UI display)
export interface DepartmentWithStats extends Department {
  memberCount: number;
  projectCount: number;
  totalBudget: number;
}

// Convert Firestore document to Department object
const departmentConverter = {
  fromFirestore(snapshot: QueryDocumentSnapshot): Department {
    const data = snapshot.data();

    // Handle Firestore timestamps
    let createdAt = new Date();
    let updatedAt = new Date();

    if (data.createdAt) {
      if (typeof data.createdAt.toDate === 'function') {
        createdAt = data.createdAt.toDate();
      } else if (data.createdAt.seconds) {
        createdAt = new Date(data.createdAt.seconds * 1000);
      }
    }

    if (data.updatedAt) {
      if (typeof data.updatedAt.toDate === 'function') {
        updatedAt = data.updatedAt.toDate();
      } else if (data.updatedAt.seconds) {
        updatedAt = new Date(data.updatedAt.seconds * 1000);
      }
    }

    return {
      id: snapshot.id,
      name: data.name,
      description: data.description || null,
      budget: data.budget || null,
      createdAt: createdAt,
      updatedAt: updatedAt
    };
  },
  toFirestore(department: Partial<Department>): DocumentData {
    return {
      name: department.name,
      description: department.description || null,
      budget: department.budget || null,
      updatedAt: serverTimestamp()
    };
  }
};

// Collection reference
const departmentsCollection = collection(db, 'departments');

// Get all departments with stats
export async function getAllDepartments(): Promise<DepartmentWithStats[]> {
  try {
    const snapshot = await getDocs(departmentsCollection);

    // Get all departments
    const departments = snapshot.docs.map(doc => departmentConverter.fromFirestore(doc));

    // For each department, get related counts
    const departmentsWithStats = await Promise.all(departments.map(async (dept) => {
      // Get users in department
      const usersQuery = query(collection(db, 'users'), where('departmentId', '==', dept.id));
      const usersSnapshot = await getDocs(usersQuery);

      // Get projects in department
      const projectsQuery = query(collection(db, 'projects'), where('departmentId', '==', dept.id));
      const projectsSnapshot = await getDocs(projectsQuery);

      // Calculate total budget from projects
      let totalBudget = 0;
      projectsSnapshot.docs.forEach(doc => {
        const projectData = doc.data();
        totalBudget += projectData.budget || 0;
      });

      // Return department with stats
      return {
        ...dept,
        memberCount: usersSnapshot.size,
        projectCount: projectsSnapshot.size,
        totalBudget
      };
    }));

    return departmentsWithStats;
  } catch (error) {
    console.error('Error getting departments:', error);
    throw error;
  }
}

// Get department by ID
export async function getDepartmentById(id: string): Promise<Department | null> {
  try {
    const docRef = doc(db, 'departments', id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return departmentConverter.fromFirestore(snapshot as QueryDocumentSnapshot);
  } catch (error) {
    console.error(`Error getting department ${id}:`, error);
    throw error;
  }
}

// Create new department
export async function createDepartment(departmentData: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<Department> {
  try {
    const data = {
      ...departmentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(departmentsCollection, data);
    const newDoc = await getDoc(docRef);

    return departmentConverter.fromFirestore(newDoc as QueryDocumentSnapshot);
  } catch (error) {
    console.error('Error creating department:', error);
    throw error;
  }
}

// Update department
export async function updateDepartment(id: string, departmentData: Partial<Department>): Promise<Department> {
  try {
    const docRef = doc(db, 'departments', id);

    // Add updatedAt timestamp
    const data = {
      ...departmentData,
      updatedAt: serverTimestamp()
    };

    await updateDoc(docRef, data);

    // Get updated document
    const updatedDoc = await getDoc(docRef);

    if (!updatedDoc.exists()) {
      throw new Error(`Department with ID ${id} not found`);
    }

    return departmentConverter.fromFirestore(updatedDoc as QueryDocumentSnapshot);
  } catch (error) {
    console.error(`Error updating department ${id}:`, error);
    throw error;
  }
}

// Delete department
export async function deleteDepartment(id: string): Promise<void> {
  try {
    // Check if department has any users or projects
    const usersQuery = query(collection(db, 'users'), where('departmentId', '==', id));
    const usersSnapshot = await getDocs(usersQuery);

    if (!usersSnapshot.empty) {
      throw new Error('Cannot delete department with associated users');
    }

    const projectsQuery = query(collection(db, 'projects'), where('departmentId', '==', id));
    const projectsSnapshot = await getDocs(projectsQuery);

    if (!projectsSnapshot.empty) {
      throw new Error('Cannot delete department with associated projects');
    }

    // Delete the department
    await deleteDoc(doc(db, 'departments', id));
  } catch (error) {
    console.error(`Error deleting department ${id}:`, error);
    throw error;
  }
}

// Check if department name exists
export async function departmentNameExists(name: string, excludeId?: string): Promise<boolean> {
  try {
    const q = query(departmentsCollection, where('name', '==', name));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return false;
    }

    // If we're checking for an update operation, exclude the current department
    if (excludeId) {
      return snapshot.docs.some(doc => doc.id !== excludeId);
    }

    return true;
  } catch (error) {
    console.error(`Error checking if department name ${name} exists:`, error);
    throw error;
  }
}
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
import { formatDate } from '../utils/dateUtils';

// Local implementation of toJsDate
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

// User type definition
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  department: string | null;
  departmentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  departmentName?: string;
  phone?: string;
  bio?: string;
  jobTitle?: string;
}

// Convert Firestore document to User object
const userConverter = {
  fromFirestore(snapshot: QueryDocumentSnapshot): User {
    const data = snapshot.data();

    // Handle Firestore timestamps
    let createdAt = new Date();
    let updatedAt = new Date();

    if (data.createdAt) {
      createdAt = toJsDate(data.createdAt) || new Date();
    }

    if (data.updatedAt) {
      updatedAt = toJsDate(data.updatedAt) || new Date();
    }

    return {
      id: snapshot.id,
      name: data.name || '',
      email: data.email || '',
      password: data.password || undefined,
      role: data.role || 'USER',
      department: data.department || null,
      departmentId: data.departmentId || null,
      createdAt: createdAt,
      updatedAt: updatedAt,
      phone: data.phone || undefined,
      bio: data.bio || undefined,
      jobTitle: data.jobTitle || undefined
    };
  },
  toFirestore(user: Partial<User>): DocumentData {
    const { password, ...userData } = user;
    return {
      ...userData,
      updatedAt: serverTimestamp()
    };
  }
};

// Collection reference
const usersCollection = collection(db, 'users');

// Get all users
export async function getAllUsers(): Promise<User[]> {
  try {
    const snapshot = await getDocs(usersCollection);
    const users = snapshot.docs.map(doc => userConverter.fromFirestore(doc));

    // Fetch department names for each user
    const usersWithDepartments = await Promise.all(users.map(async (user) => {
      if (user.departmentId) {
        try {
          const deptDoc = await getDoc(doc(db, 'departments', user.departmentId));
          if (deptDoc.exists()) {
            const deptData = deptDoc.data();
            return {
              ...user,
              departmentName: deptData.name || null
            };
          }
        } catch (error) {
          console.error(`Error fetching department for user ${user.id}:`, error);
        }
      }
      return user;
    }));

    return usersWithDepartments;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const docRef = doc(db, 'users', id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return userConverter.fromFirestore(snapshot as QueryDocumentSnapshot);
  } catch (error) {
    console.error(`Error getting user ${id}:`, error);
    throw error;
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const q = query(usersCollection, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    return userConverter.fromFirestore(snapshot.docs[0] as QueryDocumentSnapshot);
  } catch (error) {
    console.error(`Error getting user by email ${email}:`, error);
    throw error;
  }
}

// Create new user
export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  try {
    const data = {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(usersCollection, data);
    const newDoc = await getDoc(docRef);

    return userConverter.fromFirestore(newDoc as QueryDocumentSnapshot);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update user
export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  try {
    const docRef = doc(db, 'users', id);

    // Add updatedAt timestamp
    const data = {
      ...userData,
      updatedAt: serverTimestamp()
    };

    await updateDoc(docRef, data);

    // Get updated document
    const updatedDoc = await getDoc(docRef);

    if (!updatedDoc.exists()) {
      throw new Error(`User with ID ${id} not found`);
    }

    return userConverter.fromFirestore(updatedDoc as QueryDocumentSnapshot);
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
}

// Delete user
export async function deleteUser(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', id));
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
}

export async function getUsersByDepartment(departmentId: string): Promise<User[]> {
  try {
    const q = query(usersCollection, where('departmentId', '==', departmentId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => userConverter.fromFirestore(doc));
  } catch (error) {
    console.error(`Error getting users by department ${departmentId}:`, error);
    throw error;
  }
}

export async function getUsersByRole(role: 'USER' | 'ADMIN' | 'PMO'): Promise<User[]> {
  try {
    const q = query(usersCollection, where('role', '==', role));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => userConverter.fromFirestore(doc));
  } catch (error) {
    console.error(`Error getting users by role ${role}:`, error);
    throw error;
  }
}
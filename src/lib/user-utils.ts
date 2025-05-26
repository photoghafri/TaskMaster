import { db, auth } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';

// User type definition
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  departmentId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a new user in both Firebase Auth and Firestore
 */
export async function createUser(email: string, password: string, userData: Partial<User>): Promise<User> {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    
    // Update display name if provided
    if (userData.name) {
      await updateProfile(userCredential.user, {
        displayName: userData.name
      });
    }
    
    // Create user document in Firestore
    const userDoc: Partial<User> = {
      id: uid,
      email,
      name: userData.name || email.split('@')[0],
      role: userData.role || 'USER',
      department: userData.department,
      departmentId: userData.departmentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'users', uid), userDoc);
    
    return userDoc as User;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Get a user by ID from Firestore
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return { id: userId, ...userDoc.data() } as User;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * Get a user by email from Firestore
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Update a user in Firestore
 */
export async function updateUser(userId: string, userData: Partial<User>): Promise<boolean> {
  try {
    // Don't update these fields
    const { id, email, createdAt, ...updateData } = userData;
    
    // Add updated timestamp
    const updates = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(doc(db, 'users', userId), updates);
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
}

/**
 * Delete a user from both Firebase Auth and Firestore
 */
export async function deleteUserAccount(user: FirebaseUser): Promise<boolean> {
  try {
    // Delete from Firestore first
    await deleteDoc(doc(db, 'users', user.uid));
    
    // Then delete from Firebase Auth
    await deleteUser(user);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<boolean> {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error('Error sending password reset:', error);
    return false;
  }
} 
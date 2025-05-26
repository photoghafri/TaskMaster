import { NextResponse } from 'next/server';
import { db, auth } from '../../../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Default admin credentials
const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'password',
  name: 'Admin User',
  role: 'ADMIN',
  department: 'Admin'
};

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    // First try to sign in with the admin credentials
    // If this succeeds, the admin user already exists in Firebase Auth
    try {
      const userCredential = await signInWithEmailAndPassword(auth, DEFAULT_ADMIN.email, DEFAULT_ADMIN.password);
      const uid = userCredential.user.uid;

      // Check if the user exists in Firestore
      const adminDoc = await getDoc(doc(db, 'users', uid));

      if (adminDoc.exists()) {
        return NextResponse.json({
          message: 'Admin user already exists',
          user: adminDoc.data()
        });
      }

      // If the user exists in Auth but not in Firestore, create the Firestore record
      const adminUser = {
        name: DEFAULT_ADMIN.name,
        email: DEFAULT_ADMIN.email,
        role: DEFAULT_ADMIN.role,
        department: DEFAULT_ADMIN.department,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', uid), adminUser);

      return NextResponse.json({
        message: 'Admin user Firestore record created successfully',
        user: adminUser
      });
    } catch (signInError) {
      // If sign-in fails, the user doesn't exist in Firebase Auth
      console.log('Admin user does not exist in Firebase Auth, creating new user...');
    }

    // Create admin user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      DEFAULT_ADMIN.email,
      DEFAULT_ADMIN.password
    );

    const uid = userCredential.user.uid;

    // Create admin user in Firestore
    const adminUser = {
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      role: DEFAULT_ADMIN.role,
      department: DEFAULT_ADMIN.department,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', uid), adminUser);

    return NextResponse.json({
      message: 'Admin user created successfully in both Auth and Firestore',
      user: adminUser
    });
  } catch (error) {
    console.error('Error seeding database:', error);

    // Provide more specific error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({
      error: 'Failed to seed database',
      details: errorMessage
    }, { status: 500 });
  }
}
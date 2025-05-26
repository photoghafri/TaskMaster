// Firebase User Setup Script
// Run this locally to create initial users in Firebase

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAkGE-lbEzcRVJZbKjE_SHJd38jENqut8k",
  authDomain: "project-management-f45cc.firebaseapp.com",
  projectId: "project-management-f45cc",
  storageBucket: "project-management-f45cc.firebasestorage.app",
  messagingSenderId: "1002222709659",
  appId: "1:1002222709659:web:6b1ab479efcc4102824f3e",
  measurementId: "G-JYYNYZV8LP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Users to create
const users = [
  {
    email: 'AOPS@omanairports.com',
    password: 'SecurePassword123!',
    name: 'AOPS Admin',
    role: 'admin'
  },
  {
    email: 'youremail@omanairports.com',
    password: 'SecurePassword123!',
    name: 'Test User',
    role: 'admin'
  },
  {
    email: 'manager@omanairports.com',
    password: 'SecurePassword123!',
    name: 'Project Manager',
    role: 'manager'
  },
  {
    email: 'user@omanairports.com',
    password: 'SecurePassword123!',
    name: 'Regular User',
    role: 'user'
  }
];

async function createUsers() {
  console.log('🚀 Creating Firebase users...');
  
  for (const userData of users) {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      
      // Add user data to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: new Date().toISOString()
      });
      
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    } catch (error) {
      console.error(`❌ Failed to create ${userData.email}:`, error.message);
    }
  }
  
  console.log('🎉 User creation complete!');
  console.log('\n📋 Login Credentials:');
  users.forEach(user => {
    console.log(`Email: ${user.email} | Password: ${user.password} | Role: ${user.role}`);
  });
}

createUsers().catch(console.error);

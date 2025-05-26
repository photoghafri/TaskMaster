// Seed script for users
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc,
  getDocs,
  query,
  where, 
  serverTimestamp 
} = require('firebase/firestore');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config();

// Firebase configuration
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
const db = getFirestore(app);

// Sample users data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'ADMIN',
    department: 'Management',
    departmentId: null // Will be updated after fetching departments
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'USER',
    department: 'AOCC',
    departmentId: null
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'PMO',
    department: 'BHS',
    departmentId: null
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'password123',
    role: 'USER',
    department: 'AOPS',
    departmentId: null
  }
];

// Seed users
async function seedUsers() {
  try {
    console.log('Fetching departments...');
    // Get all departments to match with users
    const departmentsRef = collection(db, 'departments');
    const departmentsSnapshot = await getDocs(departmentsRef);
    const departments = departmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name
    }));

    console.log(`Found ${departments.length} departments`);
    
    // Match department names with IDs
    for (const user of users) {
      const matchingDept = departments.find(dept => 
        dept.name.toLowerCase() === user.department.toLowerCase()
      );
      
      if (matchingDept) {
        user.departmentId = matchingDept.id;
        console.log(`Matched ${user.name} to department ${matchingDept.name} (${matchingDept.id})`);
      } else {
        console.log(`No matching department found for ${user.name} (${user.department})`);
      }
    }
    
    // Check for existing users to avoid duplicates
    const usersRef = collection(db, 'users');
    
    for (const user of users) {
      // Check if user already exists
      const q = query(usersRef, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        console.log(`User with email ${user.email} already exists, skipping...`);
        continue;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Add user to Firestore
      const userData = {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        department: user.department,
        departmentId: user.departmentId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(usersRef, userData);
      console.log(`User ${user.name} added with ID: ${docRef.id}`);
    }
    
    console.log('Users seeding completed!');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

// Run the seed function
seedUsers().then(() => {
  console.log('Seed script completed');
  process.exit(0);
}).catch(error => {
  console.error('Seed script failed:', error);
  process.exit(1);
});
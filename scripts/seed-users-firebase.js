// Script to seed users directly to Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } = require('firebase/firestore');
const bcrypt = require('bcryptjs');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkGE-lbEzcRVJZbKjE_SHJd38jENqut8k",
  authDomain: "project-management-f45cc.firebaseapp.com",
  projectId: "project-management-f45cc",
  storageBucket: "project-management-f45cc.firebasestorage.app",
  messagingSenderId: "1002222709659",
  appId: "1:1002222709659:web:6b1ab479efcc4102824f3e"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Sample user data with department associations
const userData = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'ADMIN',
    departmentName: 'AOCC'
  },
  {
    name: 'PMO Manager',
    email: 'pmo@example.com',
    password: 'pmo123',
    role: 'PMO',
    departmentName: 'OPD'
  },
  {
    name: 'AOCC User',
    email: 'aocc@example.com',
    password: 'user123',
    role: 'USER',
    departmentName: 'AOCC'
  },
  {
    name: 'AOPS User',
    email: 'aops@example.com',
    password: 'user123',
    role: 'USER',
    departmentName: 'AOPS'
  },
  {
    name: 'BHS User',
    email: 'bhs@example.com',
    password: 'user123',
    role: 'USER',
    departmentName: 'BHS'
  },
  {
    name: 'Commercial User',
    email: 'commercial@example.com',
    password: 'user123',
    role: 'USER',
    departmentName: 'Commercial'
  },
  {
    name: 'Fire User',
    email: 'fire@example.com',
    password: 'user123',
    role: 'USER',
    departmentName: 'Fire'
  },
  {
    name: 'FM User',
    email: 'fm@example.com',
    password: 'user123',
    role: 'USER',
    departmentName: 'FM'
  },
  {
    name: 'HSE User',
    email: 'hse@example.com',
    password: 'user123',
    role: 'USER',
    departmentName: 'HSE'
  },
  {
    name: 'OPD User',
    email: 'opd@example.com',
    password: 'user123',
    role: 'USER',
    departmentName: 'OPD'
  },
  {
    name: 'Security User',
    email: 'security@example.com',
    password: 'user123',
    role: 'USER',
    departmentName: 'Security'
  },
  {
    name: 'TOPS User',
    email: 'tops@example.com',
    password: 'user123',
    role: 'USER',
    departmentName: 'TOPS'
  }
];

// Function to get department by name
async function getDepartmentByName(name) {
  try {
    const departmentsRef = collection(db, 'departments');
    const q = query(departmentsRef, where('name', '==', name));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`No department found with name: ${name}`);
      return null;
    }
    
    const departmentDoc = snapshot.docs[0];
    return {
      id: departmentDoc.id,
      ...departmentDoc.data()
    };
  } catch (error) {
    console.error(`Error getting department ${name}:`, error);
    return null;
  }
}

// Function to check if user already exists
async function userExists(email) {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error(`Error checking if user exists (${email}):`, error);
    return false;
  }
}

// Function to seed users
async function seedUsers() {
  try {
    console.log('Starting to seed users...');
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const user of userData) {
      // Check if user already exists
      const exists = await userExists(user.email);
      
      if (exists) {
        console.log(`User ${user.email} already exists. Skipping.`);
        skippedCount++;
        continue;
      }
      
      // Get department ID if department name is provided
      let departmentId = null;
      let departmentName = '';
      
      if (user.departmentName) {
        const department = await getDepartmentByName(user.departmentName);
        if (department) {
          departmentId = department.id;
          departmentName = department.name;
        }
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Create the user
      const userDoc = await addDoc(collection(db, 'users'), {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        departmentId: departmentId,
        departmentName: departmentName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`Created user ${user.name} (${user.email}) with ID: ${userDoc.id}`);
      createdCount++;
    }
    
    console.log(`User seeding completed. Created: ${createdCount}, Skipped: ${skippedCount}`);
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

// Execute the seed function
seedUsers()
  .catch(console.error)
  .finally(() => {
    console.log('Seed script execution completed.');
    // Allow some time for Firebase operations to complete
    setTimeout(() => process.exit(0), 2000);
  }); 
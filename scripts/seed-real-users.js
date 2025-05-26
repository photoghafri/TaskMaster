// Script to seed real company users to Firebase
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

// Real company users data
const realUsers = [
  {
    name: 'AOPS Admin',
    email: 'AOPS@omanairports.com',
    password: 'password',
    role: 'ADMIN',
    departmentName: 'AOPS',
    jobTitle: 'Administrator'
  },
  {
    name: 'Mohammed Al Ghafri',
    email: 'mohammed.alghafri@omanairports.com',
    password: 'password123',
    role: 'USER',
    departmentName: 'OPD',
    jobTitle: 'Project Manager'
  },
  {
    name: 'Ahmed Al Balushi',
    email: 'ahmed.albalushi@omanairports.com',
    password: 'password123',
    role: 'USER',
    departmentName: 'AOCC',
    jobTitle: 'Operations Coordinator'
  },
  {
    name: 'Fatima Al Zahra',
    email: 'fatima.alzahra@omanairports.com',
    password: 'password123',
    role: 'USER',
    departmentName: 'Commercial',
    jobTitle: 'Commercial Manager'
  },
  {
    name: 'Omar Al Rashid',
    email: 'omar.alrashid@omanairports.com',
    password: 'password123',
    role: 'USER',
    departmentName: 'Security',
    jobTitle: 'Security Officer'
  },
  {
    name: 'Layla Al Hinai',
    email: 'layla.alhinai@omanairports.com',
    password: 'password123',
    role: 'USER',
    departmentName: 'HSE',
    jobTitle: 'HSE Specialist'
  },
  {
    name: 'Khalid Al Mamari',
    email: 'khalid.almamari@omanairports.com',
    password: 'password123',
    role: 'USER',
    departmentName: 'FM',
    jobTitle: 'Facilities Manager'
  },
  {
    name: 'Mariam Al Kindi',
    email: 'mariam.alkindi@omanairports.com',
    password: 'password123',
    role: 'USER',
    departmentName: 'BHS',
    jobTitle: 'BHS Technician'
  },
  {
    name: 'Saif Al Busaidi',
    email: 'saif.albusaidi@omanairports.com',
    password: 'password123',
    role: 'USER',
    departmentName: 'Fire',
    jobTitle: 'Fire Safety Officer'
  },
  {
    name: 'Noor Al Habsi',
    email: 'noor.alhabsi@omanairports.com',
    password: 'password123',
    role: 'USER',
    departmentName: 'TOPS',
    jobTitle: 'Terminal Operations Supervisor'
  },
  {
    name: 'Hassan Al Lawati',
    email: 'hassan.allawati@omanairports.com',
    password: 'password123',
    role: 'PMO',
    departmentName: 'OPD',
    jobTitle: 'PMO Manager'
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

// Function to seed real users
async function seedRealUsers() {
  try {
    console.log('🚀 Starting to seed real company users...');
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const user of realUsers) {
      // Check if user already exists
      const exists = await userExists(user.email);
      
      if (exists) {
        console.log(`✅ User ${user.email} already exists. Skipping.`);
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
        jobTitle: user.jobTitle || '',
        phone: '',
        bio: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Created user ${user.name} (${user.email}) with ID: ${userDoc.id}`);
      createdCount++;
    }
    
    console.log(`\n🎉 Real user seeding completed!`);
    console.log(`📊 Created: ${createdCount}, Skipped: ${skippedCount}`);
    console.log(`\n📝 Login credentials:`);
    console.log(`   - AOPS Admin: AOPS@omanairports.com / password`);
    console.log(`   - Mohammed Al Ghafri: mohammed.alghafri@omanairports.com / password123`);
    console.log(`   - Other users: [firstname.lastname]@omanairports.com / password123`);
    
  } catch (error) {
    console.error('❌ Error seeding real users:', error);
  }
}

// Execute the seed function
seedRealUsers()
  .catch(console.error)
  .finally(() => {
    console.log('\n🏁 Seed script execution completed.');
    // Allow some time for Firebase operations to complete
    setTimeout(() => process.exit(0), 2000);
  });

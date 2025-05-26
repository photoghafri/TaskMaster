// Firebase seed script for departments
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} = require('firebase/firestore');

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

// Departments to seed
const departments = [
  {
    name: 'AOCC',
    description: 'Airport Operations Control Center',
    budget: 450000
  },
  {
    name: 'AOPS',
    description: 'Airport Operations',
    budget: 320000
  },
  {
    name: 'BHS',
    description: 'Baggage Handling System',
    budget: 180000
  },
  {
    name: 'Commercial',
    description: 'Commercial Operations',
    budget: 380000
  },
  {
    name: 'Fire',
    description: 'Fire Safety Department',
    budget: 150000
  },
  {
    name: 'FM',
    description: 'Facility Management',
    budget: 120000
  },
  {
    name: 'HSE',
    description: 'Health, Safety, and Environment',
    budget: 200000
  },
  {
    name: 'OPD',
    description: 'Operations Planning and Development',
    budget: 280000
  },
  {
    name: 'Security',
    description: 'Airport Security',
    budget: 350000
  },
  {
    name: 'TOPS',
    description: 'Terminal Operations',
    budget: 420000
  }
];

// Seed departments
async function seedDepartments() {
  console.log('Seeding departments...');
  
  const departmentsCollection = collection(db, 'departments');
  
  for (const dept of departments) {
    try {
      // Check if department already exists
      const q = query(departmentsCollection, where('name', '==', dept.name));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Add timestamps
        const departmentWithTimestamps = {
          ...dept,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Add department
        const docRef = await addDoc(departmentsCollection, departmentWithTimestamps);
        console.log(`Department ${dept.name} added with ID: ${docRef.id}`);
      } else {
        console.log(`Department ${dept.name} already exists`);
      }
    } catch (error) {
      console.error(`Error adding department ${dept.name}:`, error);
    }
  }
  
  console.log('Seeding completed');
}

// Run the seed function
seedDepartments()
  .then(() => {
    console.log('Seed script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running seed script:', error);
    process.exit(1);
  }); 
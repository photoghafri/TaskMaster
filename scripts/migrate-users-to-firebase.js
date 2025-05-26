// Script to migrate users from Prisma to Firebase
const { PrismaClient } = require('@prisma/client');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
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

// Initialize Prisma
const prisma = new PrismaClient();

async function migrateUsers() {
  try {
    console.log('Starting user migration from Prisma to Firebase...');
    
    // Get all users from Prisma
    const users = await prisma.user.findMany({
      include: {
        departmentRef: true
      }
    });
    
    console.log(`Found ${users.length} users in Prisma database.`);
    
    // Migrate each user to Firebase
    for (const user of users) {
      console.log(`Migrating user: ${user.name} (${user.email})`);
      
      try {
        // Add user to Firestore
        const userRef = await addDoc(collection(db, 'users'), {
          name: user.name,
          email: user.email,
          password: user.password, // Note: passwords are already hashed in Prisma
          role: user.role,
          department: user.department || '',
          departmentId: user.departmentId || null,
          departmentName: user.departmentRef?.name || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        console.log(`Successfully migrated user ${user.name} with ID: ${userRef.id}`);
      } catch (error) {
        console.error(`Error migrating user ${user.name}:`, error);
      }
    }
    
    console.log('User migration completed.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Create test users if no users exist in Prisma
async function createTestUsers() {
  try {
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('No users found in Prisma database. Creating test users...');
      
      // Get departments
      const departments = await prisma.department.findMany();
      
      // Create admin user
      await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@example.com',
          password: await bcrypt.hash('admin123', 10),
          role: 'ADMIN',
          departmentId: departments[0]?.id
        }
      });
      
      // Create PMO user
      await prisma.user.create({
        data: {
          name: 'PMO Manager',
          email: 'pmo@example.com',
          password: await bcrypt.hash('pmo123', 10),
          role: 'PMO',
          departmentId: departments[1]?.id
        }
      });
      
      // Create regular users for each department
      for (let i = 0; i < departments.length; i++) {
        const dept = departments[i];
        await prisma.user.create({
          data: {
            name: `${dept.name} User`,
            email: `${dept.name.toLowerCase()}@example.com`.replace(/\s+/g, ''),
            password: await bcrypt.hash('user123', 10),
            role: 'USER',
            departmentId: dept.id
          }
        });
      }
      
      console.log('Test users created successfully.');
    } else {
      console.log(`Found ${userCount} existing users in Prisma database.`);
    }
  } catch (error) {
    console.error('Error creating test users:', error);
  }
}

async function main() {
  // First create test users if needed
  await createTestUsers();
  
  // Then migrate users to Firebase
  await migrateUsers();
}

main()
  .catch(console.error)
  .finally(() => process.exit(0)); 
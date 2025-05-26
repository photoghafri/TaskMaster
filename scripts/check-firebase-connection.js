// Script to check Firebase connection
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, serverTimestamp } = require('firebase/firestore');

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

async function checkConnection() {
  console.log('Checking Firebase connection...');
  
  try {
    // Try to add a test document
    const testCollection = collection(db, 'connection_test');
    const docRef = await addDoc(testCollection, {
      message: 'Connection test',
      timestamp: serverTimestamp()
    });
    
    console.log(`✅ Firebase connection successful! Added test document with ID: ${docRef.id}`);
    
    // Try to read from departments collection
    try {
      console.log('Checking departments collection...');
      const departmentsCollection = collection(db, 'departments');
      const snapshot = await getDocs(departmentsCollection);
      
      console.log(`Found ${snapshot.size} departments in Firestore.`);
      
      if (!snapshot.empty) {
        console.log('Departments:');
        snapshot.forEach(doc => {
          const data = doc.data();
          console.log(`- ${data.name}: ${data.description || 'No description'}`);
        });
      }
    } catch (error) {
      console.error('❌ Error reading departments:', error);
    }
    
  } catch (error) {
    console.error('❌ Firebase connection error:', error);
    
    // Check if it's a network error
    if (error.code === 'unavailable' || error.code === 'network-request-failed') {
      console.log('\nPossible causes:');
      console.log('1. No internet connection');
      console.log('2. Firewall blocking Firebase connections');
      console.log('3. Firebase project not properly configured');
    }
    
    // Check if it's a permission error
    if (error.code === 'permission-denied') {
      console.log('\nPossible causes:');
      console.log('1. Firebase security rules are restricting access');
      console.log('2. The provided API key does not have permission');
    }
  }
}

// Execute check
checkConnection()
  .catch(console.error)
  .finally(() => {
    // Allow some time for Firebase operations to complete
    setTimeout(() => process.exit(0), 2000);
  }); 
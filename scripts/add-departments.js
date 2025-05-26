// Direct database manipulation using SQLite
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Find the database file
const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');

console.log(`Looking for database at: ${dbPath}`);

if (!fs.existsSync(dbPath)) {
  console.error(`Database file not found at ${dbPath}`);
  process.exit(1);
}

// Connect to the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Create departments
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

// Create the Department table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS Department (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    budget REAL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Error creating Department table:', err);
    db.close();
    process.exit(1);
  }
  
  console.log('Department table ready');
  
  // Insert departments
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO Department (id, name, description, budget, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);
  
  let successCount = 0;
  
  departments.forEach((dept) => {
    // Generate a UUID-like ID
    const id = 'dept_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    stmt.run(id, dept.name, dept.description, dept.budget, (err) => {
      if (err) {
        console.error(`Error inserting department ${dept.name}:`, err);
      } else {
        console.log(`Department added or already exists: ${dept.name}`);
        successCount++;
      }
      
      // Check if all departments have been processed
      if (successCount === departments.length) {
        console.log('All departments processed');
        
        // Verify the departments were added
        db.all('SELECT * FROM Department', [], (err, rows) => {
          if (err) {
            console.error('Error querying departments:', err);
          } else {
            console.log(`Found ${rows.length} departments in the database:`);
            rows.forEach((row) => {
              console.log(`- ${row.name}: ${row.description} (Budget: ${row.budget})`);
            });
          }
          
          // Close the database connection
          stmt.finalize();
          db.close();
        });
      }
    });
  });
}); 
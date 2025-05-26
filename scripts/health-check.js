/**
 * Project Management App Health Check Script
 * 
 * This script performs basic checks on critical components
 * of the application to ensure they're functioning correctly.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Running TaskMaster Health Check...');

// Track any issues found
const issues = [];

// 1. Check for critical files
console.log('\n📁 Checking critical files...');
const criticalFiles = [
  'src/app/page.tsx',
  'src/components/Dashboard.tsx',
  'src/components/AuthWrapper.tsx',
  'src/components/AppLayout.tsx',
  'src/app/auth/signin/page.tsx',
  'src/app/api/projects/route.ts',
  'src/app/api/projects/[id]/route.ts',
  'src/app/api/projects/[id]/logs/route.ts',
  'src/services/projectService.ts',
  'src/services/projectLogService.ts',
  'src/lib/auth.ts'
];

criticalFiles.forEach(file => {
  try {
    const filePath = path.join(process.cwd(), file);
    fs.accessSync(filePath, fs.constants.F_OK);
    console.log(`✅ Found: ${file}`);
  } catch (error) {
    console.log(`❌ Missing: ${file}`);
    issues.push(`Missing critical file: ${file}`);
  }
});

// 2. Check authentication setup
console.log('\n🔐 Checking authentication setup...');
try {
  const authFile = fs.readFileSync(path.join(process.cwd(), 'src/lib/auth.ts'), 'utf8');
  if (authFile.includes('credentials')) {
    console.log('✅ Credentials provider configured');
  } else {
    console.log('❌ Credentials provider not found');
    issues.push('Authentication: Credentials provider not configured');
  }
} catch (error) {
  console.log('❌ Could not verify authentication setup');
  issues.push('Could not verify authentication setup');
}

// 3. Check Next.js config
console.log('\n⚙️ Checking Next.js configuration...');
try {
  const nextConfig = fs.readFileSync(path.join(process.cwd(), 'next.config.js'), 'utf8');
  console.log('✅ next.config.js found');
} catch (error) {
  console.log('❌ next.config.js missing');
  issues.push('Missing next.config.js');
}

// 4. Check for potential React rendering issues
console.log('\n⚛️ Checking React components for common issues...');

try {
  const dashboardComponent = fs.readFileSync(
    path.join(process.cwd(), 'src/components/Dashboard.tsx'), 
    'utf8'
  );
  
  // Check for common issues
  if (dashboardComponent.includes('try {') && dashboardComponent.includes('catch (error)')) {
    console.log('✅ Dashboard has error handling');
  } else {
    console.log('⚠️ Dashboard might be missing error handling');
    issues.push('Dashboard component might be missing error boundaries');
  }
  
  if (dashboardComponent.includes('statusColumns.map') && 
      dashboardComponent.includes('column.projects?.map')) {
    console.log('✅ Dashboard handles null/undefined collections safely');
  } else {
    console.log('⚠️ Dashboard might not safely handle null collections');
    issues.push('Dashboard component might not safely handle null/undefined collections');
  }
} catch (error) {
  console.log('❌ Could not analyze Dashboard component');
  issues.push('Could not analyze Dashboard component');
}

// 5. Check for Firebase configuration
console.log('\n🔥 Checking Firebase configuration...');
try {
  const firebaseConfig = fs.readFileSync(path.join(process.cwd(), 'src/lib/firebase.ts'), 'utf8');
  if (firebaseConfig.includes('initializeApp')) {
    console.log('✅ Firebase initialization found');
  } else {
    console.log('⚠️ Firebase might not be properly initialized');
    issues.push('Firebase might not be properly initialized');
  }
} catch (error) {
  console.log('❌ Firebase configuration not found at expected location');
  issues.push('Firebase configuration not found');
}

// 6. Check package.json for necessary dependencies
console.log('\n📦 Checking dependencies...');
try {
  const packageJson = require(path.join(process.cwd(), 'package.json'));
  const requiredDeps = ['next', 'react', 'firebase', 'next-auth'];
  
  for (const dep of requiredDeps) {
    if (packageJson.dependencies[dep]) {
      console.log(`✅ Found ${dep} (${packageJson.dependencies[dep]})`);
    } else {
      console.log(`❌ Missing ${dep}`);
      issues.push(`Missing required dependency: ${dep}`);
    }
  }
} catch (error) {
  console.log('❌ Could not verify dependencies');
  issues.push('Could not verify dependencies');
}

// 7. Check script commands
console.log('\n🏃 Checking script commands...');
try {
  const packageJson = require(path.join(process.cwd(), 'package.json'));
  const requiredScripts = ['dev', 'build', 'start'];
  
  for (const script of requiredScripts) {
    if (packageJson.scripts[script]) {
      console.log(`✅ Found script: ${script}`);
    } else {
      console.log(`❌ Missing script: ${script}`);
      issues.push(`Missing required script: ${script}`);
    }
  }
} catch (error) {
  console.log('❌ Could not verify script commands');
  issues.push('Could not verify script commands');
}

// Final summary
console.log('\n📊 Health Check Summary:');
if (issues.length === 0) {
  console.log('\n🎉 Great news! No issues found. Application appears to be correctly configured.');
} else {
  console.log(`\n⚠️ Found ${issues.length} potential issue${issues.length > 1 ? 's' : ''}:`);
  issues.forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue}`);
  });
  console.log('\nConsider addressing these issues to ensure proper functioning of the application.');
}

console.log('\n💡 Quick Fix Suggestions:');
console.log('  • Clear cache: npm run clean');
console.log('  • Run with fixes: npm run dev:fix');
console.log('  • Development mode with bypassed authentication: Check auth/signin page');

console.log('\n✨ Health check complete!'); 
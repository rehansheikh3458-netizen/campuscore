import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Read raw file lines first to count MONGODB_URI entries
const envContent = fs.readFileSync('.env', 'utf-8');
const lines = envContent.split(/\r?\n/);

const uriLines = [];
lines.forEach((line, index) => {
  const trimmed = line.trim();
  if (trimmed.startsWith('MONGODB_URI=') || trimmed.startsWith('MONGODB_URI =')) {
    uriLines.push({ lineNumber: index + 1, content: trimmed });
  }
});

console.log('======================================================');
console.log('🔍 CampusCore — MongoDB .env Verification & Connection Test');
console.log('======================================================');

console.log(`1. Entry Count Check:`);
console.log(`   Found ${uriLines.length} MONGODB_URI definition(s) in backend/.env.`);

if (uriLines.length === 1) {
  console.log(`   ✅ Exactly ONE MONGODB_URI entry found at line ${uriLines[0].lineNumber}.`);
} else if (uriLines.length === 0) {
  console.error(`   ❌ No MONGODB_URI definition found in backend/.env.`);
  process.exit(1);
} else {
  console.warn(`   ⚠️ Multiple MONGODB_URI definitions found on lines: ${uriLines.map(l => l.lineNumber).join(', ')}.`);
}

// Check for duplication inside the value itself
const rawLine = uriLines[0].content;
const eqIdx = rawLine.indexOf('=');
const val = rawLine.slice(eqIdx + 1).trim();

const internalOccurrences = (val.match(/MONGODB_URI=/g) || []).length;
if (internalOccurrences > 0) {
  console.error(`   ❌ Value contains duplicate "MONGODB_URI=" inside the string!`);
} else {
  console.log(`   ✅ No nested/duplicate "MONGODB_URI=" inside the value.`);
}

// Safely mask URI for logging
const maskUri = (str) => str.replace(/:\/\/([^:]+):([^@]+)@/g, '://$1:********@');
console.log(`\n2. Masked URI Configuration:`);
console.log(`   ${maskUri(val)}`);

// Validate URI pattern
const srvPattern = /^mongodb(\+srv)?:\/\/([^:]+):([^@]+)@([^\/?]+)\/?([^?]*)(.*)$/;
const isFormatValid = srvPattern.test(val);
if (isFormatValid) {
  console.log(`   ✅ Valid MongoDB URI format recognized.`);
} else {
  console.warn(`   ⚠️ URI does not match standard mongodb(+srv)://<user>:<password>@<host>/<database> format.`);
}

// Live connection test
console.log('\n3. Testing Live Connection to MongoDB Atlas:');
console.log('   (Timeout set to 10 seconds)...');

const start = Date.now();
try {
  await mongoose.connect(val, { serverSelectionTimeoutMS: 10000 });
  const elapsed = Date.now() - start;

  console.log(`\n🎉 SUCCESS! MongoDB Atlas Connected in ${elapsed}ms!`);
  console.log(`   Host:         ${mongoose.connection.host}`);
  console.log(`   Database:     ${mongoose.connection.name}`);
  console.log(`   State:        Ready (readyState: ${mongoose.connection.readyState})`);

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(`   Collections (${collections.length}): ${collections.length ? collections.map(c => c.name).join(', ') : 'Empty database (ready for sample seed)'}`);

  await mongoose.disconnect();
  console.log('\n🔒 Connection test closed cleanly.');
  console.log('======================================================');
  process.exit(0);
} catch (err) {
  const elapsed = Date.now() - start;
  console.error(`\n❌ CONNECTION FAILED after ${elapsed}ms:`);
  console.error(`   ${err.name}: ${err.message}`);

  if (err.message.includes('authentication failed')) {
    console.log('\n👉 Authentication Error:');
    console.log('   The username or password in backend/.env does not match Atlas credentials.');
  } else if (err.name === 'MongoServerSelectionError') {
    console.log('\n👉 Network Error:');
    console.log('   Cannot reach the cluster. Verify Network Access (IP Whitelist) in Atlas.');
  }
  console.log('======================================================');
  process.exit(1);
}

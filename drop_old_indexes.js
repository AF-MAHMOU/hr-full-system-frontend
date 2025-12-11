// Script to drop old unique indexes and create new partial indexes
// Run this once: node drop_old_indexes.js

const mongoose = require('mongoose');

async function dropOldIndexes() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI || 'mongodb+srv://emad_admin:VTleW62xq1Dpywdx@payroll-cluster-system.n3cu4rw.mongodb.net/hr-system';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Drop old unique index on departments.code
    try {
      await db.collection('departments').dropIndex('code_1');
      console.log('✅ Dropped old index: departments.code_1');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️  Index departments.code_1 does not exist (already dropped)');
      } else {
        console.error('Error dropping departments.code_1:', err.message);
      }
    }
    
    // Drop old unique index on positions.code
    try {
      await db.collection('positions').dropIndex('code_1');
      console.log('✅ Dropped old index: positions.code_1');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️  Index positions.code_1 does not exist (already dropped)');
      } else {
        console.error('Error dropping positions.code_1:', err.message);
      }
    }
    
    console.log('\n✅ Done! The new partial unique indexes will be created automatically when the app starts.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

dropOldIndexes();

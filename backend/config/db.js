import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in backend/.env!');
    console.warn('👉 Please set MONGODB_URI in backend/.env to your MongoDB Atlas connection string.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return true;
  } catch (error) {
    console.error('⚠️  MongoDB Connection Warning / Error:');
    console.error(`   Message: ${error.message}`);
    console.warn('\n👉 To connect to MongoDB Atlas:');
    console.warn('   1. Sign in to https://cloud.mongodb.com');
    console.warn('   2. Create a free cluster or select an existing cluster');
    console.warn('   3. Add your current IP in Network Access (or allow 0.0.0.0/0 for testing)');
    console.warn('   4. Under Database Access, create a database user with password');
    console.warn('   5. Click "Connect" -> "Drivers" -> Copy the connection string');
    console.warn('   6. Paste it into backend/.env as MONGODB_URI=mongodb+srv://...\n');
    return false;
  }
};

export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

export default connectDB;

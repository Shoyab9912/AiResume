import mongoose from 'mongoose';

async function connect() {
  try {
    const connectionDB = await mongoose.connect(process.env.MONGO_URI as string);
    console.log("connection successful", connectionDB.connection.host);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("mongoose connection failed", message);
    process.exit(1);
  }
}

export default connect;
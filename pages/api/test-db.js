import {initMongoose} from "../../lib/mongoose";
import mongoose from "mongoose";

export default async function handler(req, res) {
  try {
    const envs = {
      MONGODB_URI: !!process.env.MONGODB_URI,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
    };

    await initMongoose();
    const dbState = mongoose.connection.readyState;
    
    res.status(200).json({
      status: 'ok',
      dbState,
      envs,
      message: 'Database connection successful'
    });
  } catch (e) {
    res.status(500).json({
      status: 'error',
      message: e.message,
      stack: e.stack
    });
  }
}

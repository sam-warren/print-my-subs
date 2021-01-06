import mongoose from "mongoose";
import User from "./dbUser";
import Token from "./dbToken";
import * as dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL);
};

const dbModels = { User, Token };

export { connectDb };

export default dbModels;

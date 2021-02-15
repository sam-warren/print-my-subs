import mongoose from "mongoose";
import User from "./dbUser";
import Token from "./dbToken";
import * as dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const connectDb = () => {
  return mongoose.connect(`mongodb://root:password@${process.env.LOCAL_IPV4}:27017/?authSource=admin`);
};

const dbModels = { User, Token };

export { connectDb };

export default dbModels;


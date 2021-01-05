import mongoose from "mongoose";
import User from "./user";
import Token from "./token";
import * as dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL);
};

const models = { User, Token };

export { connectDb };

export default models;

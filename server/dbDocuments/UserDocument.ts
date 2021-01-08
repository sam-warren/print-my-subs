import * as mongoose from "mongoose";

export interface UserDocument extends mongoose.Document {
  id: string;
  username: string;
}

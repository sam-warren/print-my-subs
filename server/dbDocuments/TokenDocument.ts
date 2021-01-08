import * as mongoose from "mongoose"

export interface TokenDocument extends mongoose.Document {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
}

import { exception } from "console";
import mongoose from "mongoose";
import { TokenDocument } from "../dbDocuments/TokenDocument";

const tokenSchema = new mongoose.Schema(
  {
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expiresIn: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

tokenSchema.statics.findByUser = async function (userId) {
  let token = await this.findOne({
    userId: userId,
  });

  if (!token) {
    return new exception("No access token found in database");
  }

  return token;
};

const Token = mongoose.model<TokenDocument>("Token", tokenSchema);

export default Token;


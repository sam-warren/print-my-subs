import { exception } from "console";
import mongoose from "mongoose";

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
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    // },
  },
  { timestamps: true }
);

tokenSchema.statics.findByUserId = async function (user) {
  let token = await this.findOne({
    user: user,
  });

  if (!token) {
    return new exception("No access token found in database");
  }

  return user;
};

const Token = mongoose.model("Token", tokenSchema);

export default Token;

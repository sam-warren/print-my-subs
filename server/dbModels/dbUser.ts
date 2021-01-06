import { exception } from "console";
import mongoose, { QueryOptions } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.statics.findByUsername = async function (username) {
  let user = await this.findOne({
    username: username,
  });

  if (!user) {
    return new exception("User could not be found.");
  }

  return user;
};

userSchema.statics.findByUserId = async function (userId) {
  let user = await this.findOne({
    id: userId,
  });

  if (!user) {
    return new exception("User could not be found.");
  }

  return user;
};

userSchema.pre("remove", function (next: any) {
  this.model("Token").deleteMany({ user: this._id }, next);
});

const User = mongoose.model("User", userSchema);

export default User;

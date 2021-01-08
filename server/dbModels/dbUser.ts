import { exception } from "console";
import mongoose, { QueryOptions } from "mongoose";
import { UserDocument } from "../dbDocuments/UserDocument";

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

var userModel = mongoose.model("userModel", userSchema);

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

userSchema.pre("save", function (next: any) {
  var self = this;
  userModel.find({ id: self.id }, function (err, docs) {
    if (!docs.length) {
      next();
    } else {
      console.log("User already exists!");
      next(new Error("User exists!"));
    }
  });
});

const User = mongoose.model<UserDocument>("User", userSchema);

export default User;

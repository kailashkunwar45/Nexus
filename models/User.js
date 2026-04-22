import {model, models, Schema} from "mongoose";

const UserSchema = new Schema({
  name: String,
  email: String,
  password: {type: String, select: false},
  image: String,
  cover: String,
  bio: String,
  username: {type: String, unique: true},
  dob: Date,
  phone: String,
  gender: String,
  onboarded: {type: Boolean, default: false},
});

const User = models?.User || model('User', UserSchema);

export default User;
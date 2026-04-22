import {initMongoose} from "../../lib/mongoose";
import {authOptions} from "./auth/[...nextauth]";
import {unstable_getServerSession} from "next-auth";
import User from "../../models/User";

export default async function handler(req, res) {
  await initMongoose();
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({message: 'Not authenticated'});
  }

  if (req.method === 'PUT') {
    const {bio, name, username, dob, phone, gender, onboarded} = req.body;
    
    // Check if username is already taken by another user
    if (username) {
      const existingUser = await User.findOne({username});
      if (existingUser && existingUser._id.toString() !== session.user.id) {
        return res.status(400).json({message: 'Username already taken'});
      }
    }

    const updateData = {bio, name, username};
    if (dob) updateData.dob = dob;
    if (phone) updateData.phone = phone;
    if (gender) updateData.gender = gender;
    if (onboarded !== undefined) updateData.onboarded = onboarded;

    await User.findByIdAndUpdate(session.user.id, updateData);
    return res.json('ok');
  }

  res.status(405).json({message: 'Method not allowed'});
}
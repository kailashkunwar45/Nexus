import {initMongoose} from "../../lib/mongoose";
import User from "../../models/User";
import bcrypt from "bcryptjs";

export default async function handle(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  await initMongoose();
  const {name, email, password} = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({message: 'Missing fields'});
  }

  const existingUser = await User.findOne({email});
  if (existingUser) {
    return res.status(400).json({message: 'User already exists'});
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    // Provide a default username derived from name
    username: name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000)
  });

  res.status(201).json({message: 'User created'});
}

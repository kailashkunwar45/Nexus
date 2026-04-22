import {initMongoose} from "../../lib/mongoose";
import User from "../../models/User";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "./auth/[...nextauth]";
import Block from "../../models/Block";

export default async function handle(req, res) {
  await initMongoose();
  const session = await unstable_getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({message: 'Not authenticated'});
  }

  const {q} = req.query;
  if (!q) {
    return res.json([]);
  }

  // Get blocked users to exclude from search
  const blockedByMe = await Block.find({source: session.user.id});
  const blockedMe = await Block.find({destination: session.user.id});
  const blockedIds = [
    ...blockedByMe.map(b => b.destination),
    ...blockedMe.map(b => b.source)
  ];

  const regex = new RegExp(q, 'i'); // case insensitive match
  
  const users = await User.find({
    $and: [
      { 
        $or: [
          { name: { $regex: regex } },
          { username: { $regex: regex } }
        ]
      },
      { _id: { $nin: blockedIds } },
      { onboarded: true }
    ]
  }).limit(10);

  res.json(users);
}

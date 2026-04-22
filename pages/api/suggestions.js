import {initMongoose} from "../../lib/mongoose";
import {authOptions} from "./auth/[...nextauth]";
import {unstable_getServerSession} from "next-auth";
import User from "../../models/User";
import Follower from "../../models/Follower";

export default async function handler(req, res) {
  await initMongoose();
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({message: 'Not authenticated'});
  }

  // Get people I follow
  const myFollows = await Follower.find({source: session.user.id});
  const idsOfPeopleIFollow = myFollows.map(f => f.destination.toString());

  // Suggest users I don't follow, excluding myself
  const users = await User.find({
    _id: { $nin: [...idsOfPeopleIFollow, session.user.id] },
    onboarded: true
  }).limit(5);

  res.json(users);
}

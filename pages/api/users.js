import mongoose from "mongoose";
import {initMongoose} from "../../lib/mongoose";
import User from "../../models/User";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "./auth/[...nextauth]";
import Follower from "../../models/Follower";
import FollowRequest from "../../models/FollowRequest";

export default async function handle(req, res) {
  await initMongoose();
  const session = await unstable_getServerSession(req, res, authOptions);

  if (req.method === 'PUT') {
    const {username} = req.body;
    await User.findByIdAndUpdate(session.user.id, {username});
    res.json('ok');
  }
  if (req.method === 'GET') {
    const {id,username} = req.query;
    const user = id
      ? await User.findById(id)
      : await User.findOne({username});
    const follow = await Follower.findOne({
      source:session.user.id,
      destination:user._id
    });
    
    // Check block status
    let isBlocked = false;
    if (session) {
      const Block = mongoose.models.Block || mongoose.model('Block');
      const blockDoc = await Block.findOne({
        source: session.user.id,
        destination: user._id
      });
      isBlocked = !!blockDoc;
    }

    // Check follow request status
    let isRequested = false;
    if (session) {
      const reqDoc = await FollowRequest.findOne({
        source: session.user.id,
        destination: user._id,
        status: 'pending'
      });
      isRequested = !!reqDoc;
    }

    res.json({user,follow,isBlocked,isRequested});
  }

}
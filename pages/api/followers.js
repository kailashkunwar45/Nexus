import {initMongoose} from "../../lib/mongoose";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "./auth/[...nextauth]";
import Follower from "../../models/Follower";
import User from "../../models/User";
import FollowRequest from "../../models/FollowRequest";

export default async function handle(req, res) {
  await initMongoose();
  const session = await unstable_getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({message: 'Not authenticated'});
  }

  const {destination} = req.body;
  const targetUser = await User.findById(destination);

  if (!targetUser) {
    return res.status(404).json({message: 'User not found'});
  }

  const existingFollow = await Follower.findOne({destination, source: session.user.id});
  
  if (existingFollow) {
    // Unfollow
    await Follower.deleteOne({_id: existingFollow._id});
    return res.json({status: 'unfollowed'});
  } else {
    // Check if target is private
    if (targetUser.isPrivate) {
      // Check if there is already a pending request
      const existingRequest = await FollowRequest.findOne({
        destination, 
        source: session.user.id,
        status: 'pending'
      });

      if (existingRequest) {
        // Cancel request
        await FollowRequest.deleteOne({_id: existingRequest._id});
        return res.json({status: 'request_cancelled'});
      } else {
        // Create request
        await FollowRequest.create({
          destination, 
          source: session.user.id,
          status: 'pending'
        });
        return res.json({status: 'requested'});
      }
    } else {
      // Follow immediately
      const f = await Follower.create({destination, source: session.user.id});
      return res.json({status: 'followed', follow: f});
    }
  }
}
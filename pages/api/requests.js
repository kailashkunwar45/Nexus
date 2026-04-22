import {initMongoose} from "../../lib/mongoose";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "./auth/[...nextauth]";
import FollowRequest from "../../models/FollowRequest";
import Follower from "../../models/Follower";

export default async function handle(req, res) {
  await initMongoose();
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({message: 'Not authenticated'});
  }

  if (req.method === 'GET') {
    const requests = await FollowRequest.find({
      destination: session.user.id,
      status: 'pending'
    }).populate('source');
    
    return res.json(requests);
  }

  if (req.method === 'POST') {
    const { requestId, action } = req.body;
    
    const request = await FollowRequest.findById(requestId);
    if (!request || request.destination.toString() !== session.user.id) {
      return res.status(403).json({message: 'Not authorized'});
    }

    if (action === 'accept') {
      await FollowRequest.updateOne({_id: requestId}, {status: 'accepted'});
      await Follower.create({
        source: request.source,
        destination: session.user.id
      });
      return res.json({status: 'accepted'});
    } else if (action === 'reject') {
      await FollowRequest.updateOne({_id: requestId}, {status: 'rejected'});
      return res.json({status: 'rejected'});
    }
  }
}

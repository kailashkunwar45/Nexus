import {initMongoose} from "../../lib/mongoose";
import {authOptions} from "./auth/[...nextauth]";
import {unstable_getServerSession} from "next-auth";
import Block from "../../models/Block";

export default async function handler(req, res) {
  await initMongoose();
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({message: 'Not authenticated'});
  }

  const {destination} = req.body;

  if (req.method === 'POST') {
    const existingBlock = await Block.findOne({
      source: session.user.id,
      destination
    });

    if (existingBlock) {
      await Block.deleteOne({ _id: existingBlock._id });
      return res.json({ blocked: false });
    } else {
      await Block.create({
        source: session.user.id,
        destination
      });
      return res.json({ blocked: true });
    }
  }

  if (req.method === 'GET') {
    const blocks = await Block.find({ source: session.user.id });
    res.json(blocks);
  }
}

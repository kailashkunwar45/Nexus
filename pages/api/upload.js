import multiparty from 'multiparty';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import {initMongoose} from "../../lib/mongoose";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "./auth/[...nextauth]";
import User from "../../models/User";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handle(req, res) {
  await initMongoose();
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const form = new multiparty.Form();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    const type = Object.keys(files)[0];
    const fileInfo = files[type][0];
    const filename = fileInfo.path.split('/').slice(-1)[0];
    
    try {
      const result = await cloudinary.uploader.upload(fileInfo.path, {
        public_id: filename,
        folder: 'nexus',
      });

      if (type === 'cover' || type === 'image') {
        await User.findByIdAndUpdate(session.user.id, {
          [type]: result.secure_url,
        });
      }

      fs.unlinkSync(fileInfo.path);
      res.json({ files, err: null, data: result, fileInfo, src: result.secure_url });
    } catch (uploadError) {
      console.error(uploadError);
      res.status(500).json({ error: 'Upload failed' });
    }
  });
}

export const config = {
  api: {
    bodyParser: false,
  }
};
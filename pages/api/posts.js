import {initMongoose} from "../../lib/mongoose";
import Post from "../../models/Post";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "./auth/[...nextauth]";
import Like from "../../models/Like";
import Follower from "../../models/Follower";
import Block from "../../models/Block";
import User from "../../models/User";

export default async function handler(req, res) {
  await initMongoose();
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({message: 'Not authenticated'});
  }

  // Get people I blocked and people who blocked me
  const blockedByMe = await Block.find({source: session.user.id});
  const blockedMe = await Block.find({destination: session.user.id});
  const blockedIds = [
    ...blockedByMe.map(b => b.destination),
    ...blockedMe.map(b => b.source)
  ];

  if (req.method === 'GET') {
    const {id} = req.query;
    if (id) {
      const post = await Post.findById(id)
        .populate('author')
        .populate({
          path: 'parent',
          populate: 'author',
        });
      
      // Check if author is blocked
      if (blockedIds.some(bid => bid.toString() === post.author._id.toString())) {
        return res.status(404).json({message: 'Post not found'});
      }
      
      res.json({post});
    } else {
      const parent = req.query.parent || null;
      const author = req.query.author;
      let searchFilter;
      
      if (!author && !parent) {
        const myFollows = await Follower.find({source: session.user.id}).exec();
        const idsOfPeopleIFollow = myFollows.map(f => f.destination);
        searchFilter = {
          author: [...idsOfPeopleIFollow, session.user.id],
          parent: null,
          author: { $nin: blockedIds } // Filter out blocked users
        };
      } else if (author) {
        searchFilter = {author};
        if (blockedIds.some(bid => bid.toString() === author)) {
          return res.json({posts: [], idsLikedByMe: []});
        }
        
        if (author !== session.user.id) {
          const authorUser = await User.findById(author);
          if (authorUser?.isPrivate) {
            const isFollowing = await Follower.findOne({source: session.user.id, destination: author});
            if (!isFollowing) {
              return res.json({posts: [], idsLikedByMe: []});
            }
          }
        }
      } else if (parent) {
        searchFilter = {parent, author: { $nin: blockedIds }};
      }
      
      const posts = await Post.find(searchFilter)
        .populate('author')
        .populate({
          path: 'parent',
          populate: 'author',
        })
        .sort({createdAt: -1})
        .limit(20)
        .exec();

      let postsLikedByMe = [];
      if (session) {
        postsLikedByMe = await Like.find({
          author:session.user.id,
          post:posts.map(p => p._id),
        });
      }
      let idsLikedByMe = postsLikedByMe.map(like => like.post);
      res.json({
        posts,
        idsLikedByMe,
      });
    }
  }

  if (req.method === 'POST') {
    const {text,parent,images} = req.body;
    if (!text?.trim() && (!images || images.length === 0)) {
      return res.status(400).json({message: 'Post cannot be empty'});
    }
    const post = await Post.create({
      author:session.user.id,
      text,
      parent,
      images,
    });
    if (parent) {
      const parentPost = await Post.findById(parent);
      parentPost.commentsCount = await Post.countDocuments({parent});
      await parentPost.save();
    }
    res.json(post);
  }

  if (req.method === 'PUT') {
    try {
      const {id, text} = req.body;
      if (!id) return res.status(400).json({message: 'Missing post ID'});
      
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({message: 'Post not found'});
      
      if (post.author.toString() !== session.user.id) {
        return res.status(403).json({message: 'Not authorized'});
      }
      if (!text?.trim()) {
        return res.status(400).json({message: 'Post cannot be empty'});
      }
      post.text = text;
      await post.save();
      res.json(post);
    } catch (e) {
      console.error(e);
      res.status(500).json({message: 'Server error', error: e.message});
    }
  }

  if (req.method === 'DELETE') {
    const {id} = req.query;
    const post = await Post.findById(id);
    if (post.author.toString() !== session.user.id) {
      return res.status(403).json({message: 'Not authorized'});
    }
    await Post.findByIdAndDelete(id);
    res.json('ok');
  }
}
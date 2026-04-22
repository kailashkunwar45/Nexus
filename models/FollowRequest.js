import mongoose, {model, models, Schema} from "mongoose";

const FollowRequestSchema = new Schema({
  source: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
  destination: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
  status: {type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending'}
}, {timestamps: true});

const FollowRequest = models?.FollowRequest || model('FollowRequest', FollowRequestSchema);

export default FollowRequest;

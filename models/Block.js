import mongoose, {model, models, Schema} from "mongoose";

const BlockSchema = new Schema({
  source: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
  destination: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
}, {timestamps: true});

const Block = models?.Block || model('Block', BlockSchema);

export default Block;

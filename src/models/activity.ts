import mongoose, { Document, Model, Types } from "mongoose";
import { IUser } from "./user";

export interface IActivity extends Document {
  ip: string;
  action: string;
  time: Date;
  user: Types.ObjectId | IUser;
}

interface IActivityModel extends Model<IActivity> {}

const ActivitySchema = new mongoose.Schema<IActivity, IActivityModel>(
  {
    action: { type: String, required: true },
    ip: { type: String, default: "login" },
    time: { type: Date },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const ActivityModel = mongoose.model<IActivity, IActivityModel>(
  "Activity",
  ActivitySchema
);

export default ActivityModel;

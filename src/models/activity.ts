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

    time: { type: Date },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ip: {
      type: mongoose.Schema.Types.String,
      required: true,
      validate: {
        validator: function (value: string) {
          // Use a regular expression to validate that the value is a valid IP address
          return /^([0-9]{1,3}\.){3}[0-9]{1,3}$/.test(value);
        },
        message: (props) => `${props.value} is not a valid IP address`,
      },
    },
  },
  { timestamps: true }
);

const ActivityModel = mongoose.model<IActivity, IActivityModel>(
  "Activity",
  ActivitySchema
);

export default ActivityModel;

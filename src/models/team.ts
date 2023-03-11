import mongoose, { Document, Model, Types } from "mongoose";
import { IUser } from "./user";

export interface ITeam extends Document {
  name: string;
  lead: Types.ObjectId | IUser;
  about: string;
  members: [Types.ObjectId | IUser];
}

interface ITeamModel extends Model<ITeam> {}

const TeamSchema = new mongoose.Schema<ITeam, ITeamModel>(
  {
    name: { type: String, required: true },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    about: { type: String },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // unique: true,
      },
    ],
  },
  { timestamps: true }
);

const TeamModel = mongoose.model<ITeam, ITeamModel>("Team", TeamSchema);

export default TeamModel;

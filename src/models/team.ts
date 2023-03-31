import mongoose, { Document, Model, Types } from "mongoose";
import { IUser } from "./user";

export interface ITeam extends Document {
  name: string;
  lead: Types.ObjectId | IUser;
  about: string;
  members: [Types.ObjectId | IUser];
  total_salary: number;
  aggregated_salary: number;
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
    total_salary: { type: Number, default: 0 },
    aggregated_salary: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const TeamModel = mongoose.model<ITeam, ITeamModel>("Team", TeamSchema);

export default TeamModel;

import mongoose, { Document, Model, Types } from "mongoose";
import { IUser } from "./user";

export interface IRecord extends Document {
  address: string;
  remark: string;
  is_paid: boolean;
  salary: number;
  tax: number;
  transaction_url: string;
  payment_date: Date;
  user: Types.ObjectId | IUser;
}

interface IRecordModel extends Model<IRecord> {}

const RecordSchema = new mongoose.Schema<IRecord, IRecordModel>(
  {
    address: { type: String, required: true },
    remark: { type: String },
    is_paid: { type: Boolean, default: true },
    salary: { type: Number, required: true },
    tax: { type: Number },
    transaction_url: { type: String },
    payment_date: { type: Date },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const RecordModel = mongoose.model<IRecord, IRecordModel>(
  "Record",
  RecordSchema
);

export default RecordModel;

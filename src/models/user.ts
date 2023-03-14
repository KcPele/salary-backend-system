// import * as dotenv from "dotenv";
import validation from "validator";
// dotenv.config();
import { Model, Schema, HydratedDocument, model, Types } from "mongoose";
import { createNewUser, loginUser } from "../controllers/user";
import { IPermission } from "./permission";

export interface IUser {
  email: string;
  password: string;
  role: string;
  image: {
    key: string;
    url: string;
    name: string;
  };
  full_name: string;
  gender: string;
  natioanlity: string;
  job_role: string;
  start_date: Date;
  end_date: Date;
  address: string;
  phone_number: string;
  group: string;
  team: string;
  permissions: [Types.ObjectId | IPermission];
}

export interface IUserCreated extends IUser {
  token: string;
}

interface UserModel extends Model<IUserCreated> {
  loginUser(
    email: string,
    password: string
  ): Promise<HydratedDocument<IUserCreated>> | { error: string };
}

const schema = new Schema<IUser, UserModel>(
  {
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validate: [validation.isEmail, "invalid email"],
    },
    password: { type: String, required: true },
    role: {
      type: String,
      default: "basic",
      enum: ["basic", "supervisor", "admin"],
    },
    image: {
      key: { type: String, required: true },
      url: { type: String, required: true },
      name: { type: String, required: true },
    },
    full_name: { type: String },
    gender: { type: String },
    natioanlity: { type: String },
    job_role: { type: String },
    start_date: { type: Date, default: Date.now },
    end_date: { type: Date, default: null },
    address: { type: String },
    phone_number: { type: String },
    group: { type: String },
    team: { type: String },
    permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
  },
  { timestamps: true }
);

schema.static("createNewUser", createNewUser);

schema.static("loginUser", loginUser);

const User = model<IUser, UserModel>("User", schema);

export default User;

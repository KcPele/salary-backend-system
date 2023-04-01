// import * as dotenv from "dotenv";
import validation from "validator";
// dotenv.config();
import {
  Model,
  Schema,
  HydratedDocument,
  model,
  Types,
  Document,
} from "mongoose";
import { createNewUser, loginUser } from "../controllers/user";
import { IPermission } from "./permission";
import { ITeam } from "./team";
import RecordModel from "./record";

export interface IUser extends Document {
  email: string;
  last_login: Date;
  password: string;
  image: {
    key: string;
    url: string;
    name: string;
  };
  full_name: string;
  gender: string;
  natioanlity: string;
  salary: number;
  job_role: string;
  start_date: Date;
  end_date: Date;
  wallet_address: string;
  tax_rate: number;
  address: string;
  phone_number: string;
  team: Types.ObjectId | ITeam;
  permission: Types.ObjectId | IPermission | null;
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
    last_login: { type: Date, default: Date.now },
    password: { type: String, required: true },
    image: {
      key: { type: String },
      url: { type: String },
      name: { type: String },
    },
    full_name: { type: String },
    gender: { type: String },
    natioanlity: { type: String },
    job_role: { type: String },
    salary: { type: Number, default: 0 },
    tax_rate: { type: Number },
    start_date: { type: Date, default: Date.now },
    end_date: { type: Date, default: null },
    address: { type: String },
    wallet_address: { type: String },
    phone_number: { type: String },
    team: { type: Schema.Types.ObjectId, ref: "Team" },
    permission: { type: Schema.Types.ObjectId, ref: "Permission" },
  },
  { timestamps: true }
);

// schema.pre<IUser>("findOneAndRemove", async function (next) {
//   try {
//     console.log(this._id);
//     const response =

//     next();
//   } catch (err: any) {
//     next(err);
//   }
// });
const User = model<IUser, UserModel>("User", schema);
export default User;

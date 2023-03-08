// import * as dotenv from "dotenv";
// dotenv.config();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { MongooseError } from "mongoose";
const privateKey = process.env.PRIVATE_KEY;

async function createNewUser(email: string, password: string) {
  //were to use bycript an jsonwebtokek
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  try {
    const user = await User.create({ email, password: hashPassword });

    const token = jwt.sign({ _id: user._id }, privateKey as string, {
      expiresIn: 60 * 60 * 48,
    });
    return { _id: user._id, email: user.email, token };
  } catch (error) {
    let errors = error as MongooseError;

    return { errors: errors.message };
  }
}

async function loginUser(email: string, password: string) {
  //were to use bycript an jsonwebtokek
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Wrong credentials please try again");
  } else {
    const comparedPass = await bcrypt.compare(password, user.password);
    if (!comparedPass) {
      throw new Error("Wrong credentials please try again");
    } else {
      const token = jwt.sign({ _id: user._id }, privateKey as string, {
        expiresIn: 60 * 60 * 48,
      });
      return { _id: user._id, email: user.email, token };
    }
  }
}

export { createNewUser, loginUser };

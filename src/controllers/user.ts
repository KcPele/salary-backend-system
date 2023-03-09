import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { MongooseError } from "mongoose";
import { sendEmail } from "../services/sendMail";
const privateKey = process.env.PRIVATE_KEY;

const generateToken = (id: any): string => {
  return jwt.sign({ _id: id }, privateKey as string, {
    expiresIn: 60 * 60 * 48,
  });
};

const hashingPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
async function createNewUser(email: string, password: string) {
  //were to use bycript an jsonwebtokek

  const hashPassword = await hashingPassword(password);
  try {
    const user = await User.create({ email, password: hashPassword });

    const token = generateToken(user._id);
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
      const token = generateToken(user._id);
      return { _id: user._id, email: user.email, token };
    }
  }
}

const forgotPassword = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    try {
      const user = await User.findById(req.userId);
      const resetToken = generateToken(req.userId);
      sendEmail(
        "Password Reset",
        user?.email as string,
        `click the link below to reset your password:\n\n${process.env.HOST_URL}/users/reset-password/${resetToken}`
      )
        .then((data) =>
          res.status(200).json({ message: "Password reset email sent" })
        )
        .catch((error) => {
          res
            .status(500)
            .json({ message: "Error sending password reset emai" });
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

const resetPassword = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    try {
      const resetToken = req.params?.resetToken;
      const { newPassword, oldPassword } = req.body;
      const userId = jwt.verify(
        resetToken,
        process.env.PRIVATE_KEY as string
      ) as jwt.JwtPayload;
      let user = await User.findById(userId?._id);
      if (!user) throw new Error("wrong credentials");
      const oldPasswordMatch = await bcrypt.compare(oldPassword, user.password);
      if (!oldPasswordMatch) throw new Error("Incorrect old password");
      if (
        newPassword === "" ||
        newPassword === undefined ||
        newPassword.length < 6
      )
        throw new Error(
          "new password cannot be empty or less than 6 characters"
        );

      const newPasswordHash = await hashingPassword(newPassword);

      user.password = newPasswordHash;
      await user.save();
      res.status(200).json({ message: "Password reset successful" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error?.message });
    }
  }
);
export { createNewUser, loginUser, forgotPassword, resetPassword };

import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser, IUserCreated } from "../models/user";
import { MongooseError } from "mongoose";
import { sendEmail } from "../services/sendMail";
import { s3DeleteImageHelper } from "../middleware";
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
const createNewUser = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    let file = req.file as any;
    try {
      const userData: IUser = req.body;
      userData.password = await hashingPassword(userData.password);
      if (userData.password.length < 6)
        throw new Error("Password must be up to 6 characters");
      if (file) {
        let image = {
          key: file.key,
          url: file.location,
          name: file.originalname,
        };
        userData.image = image;
      }

      const user = await User.create(userData);
      const token = generateToken(user._id);
      res.status(200).json({ _id: user._id, email: user.email, token });
    } catch (error) {
      let errors = error as MongooseError;
      if (file) {
        s3DeleteImageHelper(file.key);
      }
      res.status(500).json({ errors: errors.message });
    }
  }
);

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
      const user = await User.findById(req.user?._id);
      const resetToken = generateToken(req.user?._id);
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

const updateUser = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    let file = req.file as any;
    let id = req.params?.userId;
    try {
      const user = await User.findById(id);
      if (!user) throw new Error("user not found");
      const updateData: IUser = req.body;

      if (file) {
        if (user.image.key) {
          s3DeleteImageHelper(user.image.key);
        }
        let image = {
          key: file.key,
          url: file.location,
          name: file.originalname,
        };
        updateData.image = image;
      }
      s;
      let updatedUSer = await User.findByIdAndUpdate({ _id: id }, updateData, {
        new: true,
      });
      res.status(200).json(updatedUSer);
    } catch (error: any) {
      if (file) {
        s3DeleteImageHelper(file.key);
      }
      res.status(500).json({ errors: error.message });
    }
  }
);

const deleteUser = asyncHandler(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const userId = req.params.userId;
      await User.findByIdAndDelete(userId);
      res.status(200).json({
        data: null,
        message: "User has been deleted",
      });
    } catch (error) {
      next(error);
    }
  }
);
export {
  createNewUser,
  updateUser,
  loginUser,
  deleteUser,
  forgotPassword,
  resetPassword,
};

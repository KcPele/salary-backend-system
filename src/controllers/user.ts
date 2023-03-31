import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser, IUserCreated } from "../models/user";
import { sendEmail } from "../services/sendMail";
import { s3DeleteImageHelper } from "../middleware";
import PermissionModel from "../models/permission";
import { createActivity } from "./activity";
import { generatePassword } from "../utils";
import TeamModel from "../models/team";
const privateKey = process.env.PRIVATE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;

//generating token
const generateToken = (id: any): string => {
  return jwt.sign({ _id: id }, privateKey as string, {
    expiresIn: 60 * 60 * 48,
  });
};
//hashing password
const hashingPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

//create new users
const createNewUser = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    let file = req.file as any;
    try {
      const userData: IUser = req.body;
      let password = generatePassword();
      userData.password = await hashingPassword(password);

      if (file) {
        let image = {
          key: file.key,
          url: file.location,
          name: file.originalname,
        };
        userData.image = image;
      }
      if (userData.team) {
        let team = TeamModel.findById(userData.team);
        if (!team) {
          throw new Error("Team not found");
        }
      }
      //checkand for admin role and creating one if it does not exist
      if (adminEmail === userData.email) {
        let newPermission = await PermissionModel.create({
          name: "admin",
          roles: ["read", "create", "edit", "delete"],
        });
        userData.permission = newPermission._id;
      }

      const user = await User.create(userData);
      // send email to user that was just created with his or her password
      await sendEmail(
        "User created",
        user.email,
        `your account has been created and your password is : <strong>${password}</strong>`
      );
      if (req.user) {
        createActivity("New Staff created", req.user._id);
      }
      res.status(200).json({ message: "user created successfully" });
    } catch (error: any) {
      if (file) {
        s3DeleteImageHelper(file.key);
      }
      if (error.code === 11000) {
        // duplicate key error
        res
          .status(409)
          .json({ message: "user already exists for this with these detail" });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }
);

interface IUserDocument extends IUserCreated {
  _doc: any;
  _id: any;
}

const loginUser = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const { email, password } = req.body;
    const user = (await User.findOne({ email })) as IUserDocument;
    if (!user) {
      res.status(400).json({ error: "Wrong credentials please try again" });
    } else {
      const comparedPass = await bcrypt.compare(password, user.password);
      if (!comparedPass) {
        res.status(400).json({ error: "Wrong credentials please try again" });
      } else {
        const token = generateToken(user._id);
        if (user.permission) {
          createActivity(`${user.email} logged in`, user._id);
        }
        await User.findByIdAndUpdate(
          { _id: user._id },
          { last_login: Date.now() }
        );
        let { password, ...userData } = user._doc;
        res.status(200).json({
          ...userData,
          token,
          permission: user.permission,
        });
      }
    }
  }
);

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

//updating user
const updateUser = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    let file = req.file as any;
    let id = req.params?.userId;
    try {
      const user = await User.findById(id);
      if (!user) throw new Error("user not found");
      const updateData: IUser = req.body;

      if (updateData.permission) {
        const permission = PermissionModel.findById(updateData.permission);
        if (!permission) throw new Error("perssmission does not exist");
      }
      if (updateData.team) {
        let team = TeamModel.findById(updateData.team);
        if (!team) {
          throw new Error("Team not found");
        }
      }
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

      let updatedUser = await User.findByIdAndUpdate({ _id: id }, updateData, {
        new: true,
      }).select("-password");
      createActivity(`${updatedUser?.email} was updated`, req.user._id);
      res.status(200).json(updatedUser);
    } catch (error: any) {
      if (file) {
        s3DeleteImageHelper(file.key);
      }
      res.status(500).json({ errors: error.message });
    }
  }
);

//revoking users permission
const revokePermission = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    let userId = req.params?.userId;
    let permissionId = req.params?.permissionId;
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("user not found");

      const permission = PermissionModel.findById(permissionId);
      if (!permission) throw new Error("perssmission does not exist");
      let updateData = {
        permission: null,
      };

      let updatedUser = await User.findByIdAndUpdate(
        { _id: userId },
        updateData,
        {
          new: true,
        }
      );
      createActivity(
        `${updatedUser?.email} permssion was revoked`,
        req.user._id
      );
      res.status(200).json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ errors: error.message });
    }
  }
);

//delete users
const deleteUser = asyncHandler(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const userId = req.params.userId;
      let user = await User.findByIdAndDelete(userId);
      if (user?.image.key) {
        console.log(user.image.key);
        s3DeleteImageHelper(user.image.key);
      }
      createActivity(`${user?.email} was deleted`, req.user._id);
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
  revokePermission,
  forgotPassword,
  resetPassword,
};

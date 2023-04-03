import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import PermissionModel, { IPermission } from "../models/permission";
import { createActivity } from "./activity";
import User from "../models/user";

//Get all permissions
const getAllPermission = asyncHandler(async (req: Request, res: Response) => {
  try {
    const permissions: IPermission[] = await PermissionModel.find().sort(
      "-createdAt"
    );
    res.status(200).json(permissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//create a permssion
const createPermission = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, roles } = req.body;
    if (!name) {
      throw new Error("Please provide a name for permission");
    }
    if (roles) {
      if (!Array.isArray(roles)) throw new Error("Invalid roles array");
    }
    const newPermission: IPermission = new PermissionModel({ name, roles });
    await newPermission.save();
    createActivity("New permission created", req.user._id);
    res.status(201).json(newPermission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//update a permission
const updatePermission = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, roles } = req.body;
    if (roles) {
      // Validate roles
      if (!Array.isArray(roles)) throw new Error("Invalid roles array");
    }
    const updatedPermission: IPermission | null =
      await PermissionModel.findByIdAndUpdate(
        { _id: req.params.permissionId },
        { name, roles },
        { new: true }
      );
    if (!updatedPermission) throw new Error("Permission not found");
    createActivity(
      `${updatedPermission.name} permission updated`,
      req.user._id
    );
    res.status(200).json(updatedPermission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//delete a permission
const deletePermission = asyncHandler(async (req: Request, res: Response) => {
  try {
    const deletedPermission = await PermissionModel.findByIdAndDelete(
      req.params.permissionId
    );
    if (!deletedPermission) throw new Error("Permission not found");
    await User.updateMany(
      { permission: req.params.permissionId },
      { permission: null }
    );
    createActivity(
      `${deletedPermission.name} permssion was deleted`,
      req.user._id
    );
    res.status(204).send({ message: "Successfully deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
export {
  getAllPermission,
  createPermission,
  updatePermission,
  deletePermission,
};

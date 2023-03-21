import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import PermissionModel, { IPermission } from "../models/permission";
import { createActivity } from "./activity";

const getAllPermission = asyncHandler(async (req: Request, res: Response) => {
  try {
    const permissions: IPermission[] = await PermissionModel.find();
    res.status(200).json(permissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

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

const updatePermission = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, roles } = req.body;
    if (roles) {
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

const deletePermission = asyncHandler(async (req: Request, res: Response) => {
  try {
    const deletedPermission = await PermissionModel.findByIdAndDelete(
      req.params.permissionId
    );
    if (!deletedPermission) throw new Error("Permission not found");
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

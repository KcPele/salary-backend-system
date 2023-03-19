import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import PermissionModel, { IPermission } from "../models/permission";

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
    if (updatedPermission) {
      res.status(200).json(updatedPermission);
    } else {
      res.status(404).json({ message: "Permission not found" });
    }
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
    if (deletedPermission) {
      res.status(204).send({ message: "Successfully deleted" });
    } else {
      res.status(404).json({ message: "Permission not found" });
    }
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

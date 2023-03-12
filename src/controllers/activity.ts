import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import ActivityModel from "../models/activity";
import User from "../models/user";

const getAllActivities = asyncHandler(async (req: Request, res: Response) => {
  try {
    const activitys = await ActivityModel.find();
    res.status(200).json(activitys);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

const getActivity = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { activityId } = req.params;
    const activity = await ActivityModel.findById(activityId)
      .populate("user")
      .exec();
    res.status(200).json(activity);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

const getUserActivity = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const activity = await ActivityModel.find({ user: userId })
      .populate("user")
      .exec();
    res.status(200).json(activity);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

const createActivity = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { action, userId, time, ip } = req.body;
    // Validate required fields
    if (!action || !userId || !time || !ip) {
      throw new Error("Please provide the required fields");
    }
    const user = User.findById(userId);
    if (!user) throw new Error("User not found");
    const activity = await ActivityModel.create({
      action,
      user: userId,
      time,
      ip,
    });
    res.status(200).json(activity);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

const deleteActivity = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { activityId } = req.params;
    const activity = await ActivityModel.findByIdAndDelete(activityId);
    if (!activity) throw new Error("Activity not found");
    res.status(200).json({ message: "Activity deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export {
  getAllActivities,
  getActivity,
  deleteActivity,
  createActivity,
  getUserActivity,
};

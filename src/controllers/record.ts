import { Request, Response } from "express";
import RecordModel, { IRecord } from "../models/record";
import asyncHandler from "express-async-handler";
import User from "../models/user";
import { createActivity } from "./activity";
const getAllRecords = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const records = await RecordModel.find()
      .populate({
        path: "user",
        select: "_id email full_name image",
      })
      .exec();
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

const getRecord = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { recordId } = req.params;
      const record = await RecordModel.findById(recordId)
      .populate({
        path: "user",
        select: "_id email full_name image",
      })
        .exec();
      if (!record) throw new Error("Record not found");
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

const getUserRecords = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const records = await RecordModel.find({ user: userId }).exec();
      if (!records) throw new Error("user has no records yet");
      res.status(200).json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

const createRecord = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Extract data from request body
      const {
        userId,
        address,
        is_paid,
        salary,
        transaction_url,
        payment_date,
      } = req.body;

      // Validate required fields
      if (!userId || !address || !salary || !transaction_url || !payment_date) {
        throw new Error("Please provide all required fields");
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) throw new Error("Invalid user ID");

      // Create new record
      const record = new RecordModel({
        user: userId,
        address,
        is_paid,
        salary,
        transaction_url,
        payment_date,
      });

      // Save record to database
      await record.save();
      createActivity("Record created", req.user._id);
      // Send response
      res.status(201).json(record);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

const updateRecord = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { address, is_paid, salary, transaction_url, payment_date, userId } =
      req.body;
    const recordData: Partial<IRecord> = {
      address,
      is_paid,
      salary,
      transaction_url,
      payment_date,
    };
    if (userId) {
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) throw new Error("Invalid user ID");
      recordData.user = userId;
    }
    const { recordId } = req.params;
    try {
      const record = await RecordModel.findByIdAndUpdate(
        { _id: recordId },
        recordData,
        {
          new: true,
        }
      );
      createActivity(`Record updated`, req.user._id);
      res.status(200).json(record);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);
const deleteRecord = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { recordId } = req.params;

      const record = await RecordModel.findByIdAndDelete(recordId);
      if (!record) throw new Error("Record not found");
      createActivity("Record deleted", req.user._id);
      res.json({ message: "Record deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

export {
  getAllRecords,
  createRecord,
  deleteRecord,
  updateRecord,
  getUserRecords,
  getRecord,
};

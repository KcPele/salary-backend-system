import { Request, Response } from "express";
import RecordModel, { IRecord } from "../models/record";
import asyncHandler from "express-async-handler";
import User from "../models/user";
import { ObjectId } from "mongodb";
import { createActivity } from "./activity";

const getTotalSalaryByUser = async (): Promise<
  {
    userId: string;
    totalSalary: number;
    totalTax: number;
  }[]
> => {
  const result = await RecordModel.aggregate([
    { $match: { user: { $ne: null } } },
    {
      $group: {
        _id: "$user",
        totalSalary: { $sum: "$salary" },
        totalTax: { $sum: "$tax" },
      },
    },
  ]);

  return result.map((record) => ({
    userId: record._id,
    totalSalary: record.totalSalary,
    totalTax: record.totalTax,
  }));
};

const getTotalSalary = async (): Promise<{}> => {
  const result = await RecordModel.aggregate([
    {
      $group: {
        _id: null,
        totalSalary: { $sum: "$salary" },
        totalTax: { $sum: "$tax" },
      },
    },
  ]);

  return result.length > 0
    ? { totalTax: result[0].totalTax, totalSalary: result[0].totalSalary }
    : { totalTax: 0, totalSalary: 0 };
};

const getAllRecords = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const totalSalaryByUser = await getTotalSalaryByUser();

      const total = await getTotalSalary();
      const records = await RecordModel.find({ user: { $ne: null } })
        .populate({
          path: "user",
          select: " email full_name image job_role",
        })
        .sort("-createdAt")
        .lean();

      let totalRecords = records.map((record) => {
        const userTotalSalary = totalSalaryByUser.find(
          (total) => total.userId.toString() === record.user._id.toString()
        )?.totalSalary;
        const userTotalTax = totalSalaryByUser.find(
          (total) => total.userId.toString() === record.user._id.toString()
        )?.totalTax;

        return {
          ...record,
          userTotalSalary: userTotalSalary ?? 0,
          userTotalTax: userTotalTax ?? 0,
        };
      });
      res.status(200).json({ records: totalRecords, ...total });
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
          select: " email full_name image job_role",
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
      const records = await RecordModel.find({ user: userId }).sort(
        "-createdAt"
      );
      if (!records) throw new Error("user has no records yet");
      const totalUserSalary = await RecordModel.aggregate([
        { $match: { user: new ObjectId(userId) } },
        {
          $group: {
            _id: null,
            total_user_salary: { $sum: "$salary" },
            total_user_tax: { $sum: "$tax" },
          },
        },
      ]);

      res.status(200).json({
        records,
        totalUserSalary: totalUserSalary.length
          ? totalUserSalary[0].total_user_salary
          : 0,
        totalUSerTax: totalUserSalary.length
          ? totalUserSalary[0].total_user_tax
          : 0,
      });
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
        remark,
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
      let tax = 0;
      if (user.tax_rate) {
        tax = (user.tax_rate / 100) * salary;
      }

      // Create new record
      const record = new RecordModel({
        user: userId,
        address,
        remark,
        is_paid,
        salary,
        tax,
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
    const {
      address,
      remark,
      is_paid,
      salary,
      transaction_url,
      payment_date,
      userId,
    } = req.body;
    const recordData: Partial<IRecord> = {
      address,
      remark,
      is_paid,
      salary,
      transaction_url,
      payment_date,
    };
    if (userId) {
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) throw new Error("Invalid user ID");
      if (user.tax_rate && salary) {
        recordData.tax = (user.tax_rate / 100) * salary;
      }
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

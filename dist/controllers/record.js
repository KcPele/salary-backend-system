"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecord = exports.getUserRecords = exports.updateRecord = exports.deleteRecord = exports.createRecord = exports.getAllRecords = void 0;
const record_1 = __importDefault(require("../models/record"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_1 = __importDefault(require("../models/user"));
const mongodb_1 = require("mongodb");
const activity_1 = require("./activity");
const getTotalSalaryByUser = async () => {
    const result = await record_1.default.aggregate([
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
const getTotalSalary = async () => {
    const result = await record_1.default.aggregate([
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
const getAllRecords = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const totalSalaryByUser = await getTotalSalaryByUser();
        const total = await getTotalSalary();
        const records = await record_1.default.find({ user: { $ne: null } })
            .populate({
            path: "user",
            select: " email full_name discord_username image job_role",
        })
            .sort("-createdAt")
            .lean();
        let totalRecords = records.map((record) => {
            var _a, _b;
            const userTotalSalary = (_a = totalSalaryByUser.find((total) => total.userId.toString() === record.user._id.toString())) === null || _a === void 0 ? void 0 : _a.totalSalary;
            const userTotalTax = (_b = totalSalaryByUser.find((total) => total.userId.toString() === record.user._id.toString())) === null || _b === void 0 ? void 0 : _b.totalTax;
            return Object.assign(Object.assign({}, record), { userTotalSalary: userTotalSalary !== null && userTotalSalary !== void 0 ? userTotalSalary : 0, userTotalTax: userTotalTax !== null && userTotalTax !== void 0 ? userTotalTax : 0 });
        });
        res.status(200).json(Object.assign({ records: totalRecords }, total));
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllRecords = getAllRecords;
const getRecord = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { recordId } = req.params;
        const record = await record_1.default.findById(recordId)
            .populate({
            path: "user",
            select: " email full_name discord_username image job_role",
        })
            .exec();
        if (!record)
            throw new Error("Record not found");
        res.json(record);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getRecord = getRecord;
const getUserRecords = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { userId } = req.params;
        const records = await record_1.default.find({ user: userId }).sort("-createdAt");
        if (!records)
            throw new Error("user has no records yet");
        const totalUserSalary = await record_1.default.aggregate([
            { $match: { user: new mongodb_1.ObjectId(userId) } },
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getUserRecords = getUserRecords;
const createRecord = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        // Extract data from request body
        const { userId, address, remark, is_paid, salary, transaction_url, payment_date, } = req.body;
        // Validate required fields
        if (!userId || !address || !salary || !transaction_url || !payment_date) {
            throw new Error("Please provide all required fields");
        }
        // Check if user exists
        const user = await user_1.default.findById(userId);
        if (!user)
            throw new Error("Invalid user ID");
        let tax = 0;
        if (user.tax_rate) {
            tax = (user.tax_rate / 100) * salary;
        }
        // Create new record
        const record = new record_1.default({
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
        (0, activity_1.createActivity)("Record created", req.user._id);
        // Send response
        res.status(201).json(record);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createRecord = createRecord;
const updateRecord = (0, express_async_handler_1.default)(async (req, res) => {
    const { address, remark, is_paid, salary, transaction_url, payment_date, userId, } = req.body;
    const recordData = {
        address,
        remark,
        is_paid,
        salary,
        transaction_url,
        payment_date,
    };
    if (userId) {
        // Check if user exists
        const user = await user_1.default.findById(userId);
        if (!user)
            throw new Error("Invalid user ID");
        if (user.tax_rate && salary) {
            recordData.tax = (user.tax_rate / 100) * salary;
        }
        recordData.user = userId;
    }
    const { recordId } = req.params;
    try {
        const record = await record_1.default.findByIdAndUpdate({ _id: recordId }, recordData, {
            new: true,
        });
        (0, activity_1.createActivity)(`Record updated`, req.user._id);
        res.status(200).json(record);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateRecord = updateRecord;
const deleteRecord = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { recordId } = req.params;
        const record = await record_1.default.findByIdAndDelete(recordId);
        if (!record)
            throw new Error("Record not found");
        (0, activity_1.createActivity)("Record deleted", req.user._id);
        res.json({ message: "Record deleted" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteRecord = deleteRecord;
//# sourceMappingURL=record.js.map
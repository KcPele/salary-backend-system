"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecord = exports.getUserRecords = exports.updateRecord = exports.deleteRecord = exports.createRecord = exports.getAllRecords = void 0;
const record_1 = __importDefault(require("../models/record"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_1 = __importDefault(require("../models/user"));
const getAllRecords = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const records = await record_1.default.find().populate("user").exec();
        res.json(records);
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
            .populate("user")
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
        const records = await record_1.default.find({ user: userId }).exec();
        if (!records)
            throw new Error("user has no records yet");
        res.status(200).json(records);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getUserRecords = getUserRecords;
const createRecord = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        // Extract data from request body
        const { userId, address, is_paid, salary, transaction_url, payment_date, } = req.body;
        // Validate required fields
        if (!userId || !address || !salary || !transaction_url || !payment_date) {
            throw new Error("Please provide all required fields");
        }
        // Check if user exists
        const user = await user_1.default.findById(userId);
        if (!user)
            throw new Error("Invalid user ID");
        // Create new record
        const record = new record_1.default({
            user: userId,
            address,
            is_paid,
            salary,
            transaction_url,
            payment_date,
        });
        // Save record to database
        await record.save();
        // Send response
        res.status(201).json(record);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createRecord = createRecord;
const updateRecord = (0, express_async_handler_1.default)(async (req, res) => {
    const { address, is_paid, salary, transaction_url, payment_date, userId } = req.body;
    const recordData = {
        address,
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
        recordData.user = userId;
    }
    const { recordId } = req.params;
    try {
        const record = await record_1.default.findByIdAndUpdate({ _id: recordId }, recordData, {
            new: true,
        });
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
        res.json({ message: "Record deleted" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteRecord = deleteRecord;
//# sourceMappingURL=record.js.map
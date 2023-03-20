"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserActivity = exports.createActivity = exports.deleteActivity = exports.getActivity = exports.getAllActivities = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const activity_1 = __importDefault(require("../models/activity"));
const user_1 = __importDefault(require("../models/user"));
const getAllActivities = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const activitys = await activity_1.default.find();
        res.status(200).json(activitys);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllActivities = getAllActivities;
const getActivity = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { activityId } = req.params;
        const activity = await activity_1.default.findById(activityId)
            .populate("user")
            .exec();
        res.status(200).json(activity);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getActivity = getActivity;
const getUserActivity = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { userId } = req.params;
        const activity = await activity_1.default.find({ user: userId })
            .populate("user")
            .exec();
        res.status(200).json(activity);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getUserActivity = getUserActivity;
const createActivity = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { action, userId, time } = req.body;
        // Validate required fields
        if (!action || !userId || !time) {
            throw new Error("Please provide the required fields");
        }
        const user = user_1.default.findById(userId);
        if (!user)
            throw new Error("User not found");
        const activity = await activity_1.default.create({
            action,
            user: userId,
            time,
        });
        res.status(200).json(activity);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createActivity = createActivity;
const deleteActivity = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { activityId } = req.params;
        const activity = await activity_1.default.findByIdAndDelete(activityId);
        if (!activity)
            throw new Error("Activity not found");
        res.status(200).json({ message: "Activity deleted" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteActivity = deleteActivity;
//# sourceMappingURL=activity.js.map
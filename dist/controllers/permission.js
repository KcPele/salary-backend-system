"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePermission = exports.updatePermission = exports.createPermission = exports.getAllPermission = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const permission_1 = __importDefault(require("../models/permission"));
const activity_1 = require("./activity");
const user_1 = __importDefault(require("../models/user"));
//Get all permissions
const getAllPermission = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const permissions = await permission_1.default.find().sort("-createdAt");
        res.status(200).json(permissions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAllPermission = getAllPermission;
//create a permssion
const createPermission = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { name, roles } = req.body;
        if (!name) {
            throw new Error("Please provide a name for permission");
        }
        if (roles) {
            if (!Array.isArray(roles))
                throw new Error("Invalid roles array");
        }
        const newPermission = new permission_1.default({ name, roles });
        await newPermission.save();
        (0, activity_1.createActivity)("New permission created", req.user._id);
        res.status(201).json(newPermission);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.createPermission = createPermission;
//update a permission
const updatePermission = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { name, roles } = req.body;
        if (roles) {
            // Validate roles
            if (!Array.isArray(roles))
                throw new Error("Invalid roles array");
        }
        const updatedPermission = await permission_1.default.findByIdAndUpdate({ _id: req.params.permissionId }, { name, roles }, { new: true });
        if (!updatedPermission)
            throw new Error("Permission not found");
        (0, activity_1.createActivity)(`${updatedPermission.name} permission updated`, req.user._id);
        res.status(200).json(updatedPermission);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updatePermission = updatePermission;
//delete a permission
const deletePermission = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const deletedPermission = await permission_1.default.findByIdAndDelete(req.params.permissionId);
        if (!deletedPermission)
            throw new Error("Permission not found");
        await user_1.default.updateMany({ permission: req.params.permissionId }, { permission: null });
        (0, activity_1.createActivity)(`${deletedPermission.name} permssion was deleted`, req.user._id);
        res.status(204).send({ message: "Successfully deleted" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.deletePermission = deletePermission;
//# sourceMappingURL=permission.js.map
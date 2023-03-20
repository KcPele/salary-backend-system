"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePermission = exports.updatePermission = exports.createPermission = exports.getAllPermission = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const permission_1 = __importDefault(require("../models/permission"));
const getAllPermission = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const permissions = await permission_1.default.find();
        res.status(200).json(permissions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAllPermission = getAllPermission;
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
        res.status(201).json(newPermission);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.createPermission = createPermission;
const updatePermission = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { name, roles } = req.body;
        if (roles) {
            if (!Array.isArray(roles))
                throw new Error("Invalid roles array");
        }
        const updatedPermission = await permission_1.default.findByIdAndUpdate({ _id: req.params.permissionId }, { name, roles }, { new: true });
        if (updatedPermission) {
            res.status(200).json(updatedPermission);
        }
        else {
            res.status(404).json({ message: "Permission not found" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updatePermission = updatePermission;
const deletePermission = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const deletedPermission = await permission_1.default.findByIdAndDelete(req.params.permissionId);
        if (deletedPermission) {
            res.status(204).send({ message: "Successfully deleted" });
        }
        else {
            res.status(404).json({ message: "Permission not found" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.deletePermission = deletePermission;
//# sourceMappingURL=permission.js.map
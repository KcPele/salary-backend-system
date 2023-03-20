"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const PermissionSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, unique: true },
    roles: [
        {
            type: String,
            default: "read",
            enum: ["read", "create", "edit", "delete"],
        },
    ],
});
const PermissionModel = mongoose_1.default.model("Permission", PermissionSchema);
exports.default = PermissionModel;
//# sourceMappingURL=permission.js.map
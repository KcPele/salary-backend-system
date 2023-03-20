"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ActivitySchema = new mongoose_1.default.Schema({
    action: { type: String, required: true },
    time: { type: Date },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });
const ActivityModel = mongoose_1.default.model("Activity", ActivitySchema);
exports.default = ActivityModel;
//# sourceMappingURL=activity.js.map
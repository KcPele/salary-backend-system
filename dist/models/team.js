"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const TeamSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    lead: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    about: { type: String },
    members: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User",
            // unique: true,
        },
    ],
    total_salary: { type: Number, default: 0 },
    aggregated_salary: { type: Number, default: 0 },
}, { timestamps: true });
const TeamModel = mongoose_1.default.model("Team", TeamSchema);
exports.default = TeamModel;
//# sourceMappingURL=team.js.map
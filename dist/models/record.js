"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const RecordSchema = new mongoose_1.default.Schema({
    address: { type: String, required: true },
    remark: { type: String },
    is_paid: { type: Boolean, default: true },
    salary: { type: Number, required: true },
    tax: { type: Number },
    transaction_url: { type: String },
    payment_date: { type: Date },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });
const RecordModel = mongoose_1.default.model("Record", RecordSchema);
exports.default = RecordModel;
//# sourceMappingURL=record.js.map
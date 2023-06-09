"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import * as dotenv from "dotenv";
const validator_1 = __importDefault(require("validator"));
// dotenv.config();
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator_1.default.isEmail, "invalid email"],
    },
    last_login: { type: Date, default: Date.now },
    password: { type: String, required: true },
    image: {
        key: { type: String },
        url: { type: String },
        name: { type: String },
    },
    full_name: { type: String },
    gender: { type: String },
    discord_username: { type: String },
    natioanlity: { type: String },
    job_role: { type: String },
    salary: { type: Number, default: 0 },
    tax_rate: { type: Number },
    start_date: { type: Date, default: Date.now },
    end_date: { type: Date, default: null },
    address: { type: String },
    wallet_address: { type: String },
    phone_number: { type: String },
    team: { type: mongoose_1.Schema.Types.ObjectId, ref: "Team" },
    permission: { type: mongoose_1.Schema.Types.ObjectId, ref: "Permission" },
}, { timestamps: true });
// schema.pre<IUser>("findOneAndRemove", async function (next) {
//   try {
//     console.log(this._id);
//     const response =
//     next();
//   } catch (err: any) {
//     next(err);
//   }
// });
const User = (0, mongoose_1.model)("User", schema);
exports.default = User;
//# sourceMappingURL=user.js.map
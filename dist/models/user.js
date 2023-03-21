"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import * as dotenv from "dotenv";
const validator_1 = __importDefault(require("validator"));
// dotenv.config();
const mongoose_1 = require("mongoose");
const user_1 = require("../controllers/user");
const schema = new mongoose_1.Schema({
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator_1.default.isEmail, "invalid email"],
    },
    password: { type: String, required: true },
    image: {
        key: { type: String, required: true },
        url: { type: String, required: true },
        name: { type: String, required: true },
    },
    full_name: { type: String },
    gender: { type: String },
    natioanlity: { type: String },
    job_role: { type: String },
    start_date: { type: Date, default: Date.now },
    end_date: { type: Date, default: null },
    address: { type: String },
    phone_number: { type: String },
    group: { type: String },
    team: { type: String },
    permission: { type: mongoose_1.Schema.Types.ObjectId, ref: "Permission" },
}, { timestamps: true });
schema.static("createNewUser", user_1.createNewUser);
schema.static("loginUser", user_1.loginUser);
const User = (0, mongoose_1.model)("User", schema);
exports.default = User;
//# sourceMappingURL=user.js.map
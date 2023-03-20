"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.deleteUser = exports.loginUser = exports.updateUser = exports.createNewUser = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const sendMail_1 = require("../services/sendMail");
const middleware_1 = require("../middleware");
const permission_1 = __importDefault(require("../models/permission"));
const privateKey = process.env.PRIVATE_KEY;
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ _id: id }, privateKey, {
        expiresIn: 60 * 60 * 48,
    });
};
const hashingPassword = async (password) => {
    const salt = await bcrypt_1.default.genSalt(10);
    return await bcrypt_1.default.hash(password, salt);
};
const createNewUser = (0, express_async_handler_1.default)(async (req, res) => {
    let file = req.file;
    try {
        const userData = req.body;
        userData.password = await hashingPassword(userData.password);
        if (userData.password.length < 6)
            throw new Error("Password must be up to 6 characters");
        if (file) {
            let image = {
                key: file.key,
                url: file.location,
                name: file.originalname,
            };
            userData.image = image;
        }
        const user = await user_1.default.create(userData);
        const token = generateToken(user._id);
        res.status(200).json({ _id: user._id, email: user.email, token });
    }
    catch (error) {
        if (file) {
            (0, middleware_1.s3DeleteImageHelper)(file.key);
        }
        if (error.code === 11000) {
            // duplicate key error
            res
                .status(409)
                .json({ message: "user already exists for this with these detail" });
        }
        else {
            res.status(500).json({ message: error.message });
        }
    }
});
exports.createNewUser = createNewUser;
async function loginUser(email, password) {
    //were to use bycript an jsonwebtokek
    const user = await user_1.default.findOne({ email });
    if (!user) {
        throw new Error("Wrong credentials please try again");
    }
    else {
        const comparedPass = await bcrypt_1.default.compare(password, user.password);
        if (!comparedPass) {
            throw new Error("Wrong credentials please try again");
        }
        else {
            const token = generateToken(user._id);
            return { _id: user._id, email: user.email, token };
        }
    }
}
exports.loginUser = loginUser;
const forgotPassword = (0, express_async_handler_1.default)(async (req, res) => {
    var _a, _b;
    try {
        const user = await user_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        const resetToken = generateToken((_b = req.user) === null || _b === void 0 ? void 0 : _b._id);
        (0, sendMail_1.sendEmail)("Password Reset", user === null || user === void 0 ? void 0 : user.email, `click the link below to reset your password:\n\n${process.env.HOST_URL}/users/reset-password/${resetToken}`)
            .then((data) => res.status(200).json({ message: "Password reset email sent" }))
            .catch((error) => {
            res
                .status(500)
                .json({ message: "Error sending password reset emai" });
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    try {
        const resetToken = (_a = req.params) === null || _a === void 0 ? void 0 : _a.resetToken;
        const { newPassword, oldPassword } = req.body;
        const userId = jsonwebtoken_1.default.verify(resetToken, process.env.PRIVATE_KEY);
        let user = await user_1.default.findById(userId === null || userId === void 0 ? void 0 : userId._id);
        if (!user)
            throw new Error("wrong credentials");
        const oldPasswordMatch = await bcrypt_1.default.compare(oldPassword, user.password);
        if (!oldPasswordMatch)
            throw new Error("Incorrect old password");
        if (newPassword === "" ||
            newPassword === undefined ||
            newPassword.length < 6)
            throw new Error("new password cannot be empty or less than 6 characters");
        const newPasswordHash = await hashingPassword(newPassword);
        user.password = newPasswordHash;
        await user.save();
        res.status(200).json({ message: "Password reset successful" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error === null || error === void 0 ? void 0 : error.message });
    }
});
exports.resetPassword = resetPassword;
const updateUser = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    let file = req.file;
    let id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        const user = await user_1.default.findById(id);
        if (!user)
            throw new Error("user not found");
        const updateData = req.body;
        if (updateData.permission) {
            const permission = permission_1.default.findById(updateData.permission);
            if (!permission)
                throw new Error("perssmission does not exist");
        }
        if (file) {
            if (user.image.key) {
                (0, middleware_1.s3DeleteImageHelper)(user.image.key);
            }
            let image = {
                key: file.key,
                url: file.location,
                name: file.originalname,
            };
            updateData.image = image;
        }
        let updatedUSer = await user_1.default.findByIdAndUpdate({ _id: id }, updateData, {
            new: true,
        });
        res.status(200).json(updatedUSer);
    }
    catch (error) {
        if (file) {
            (0, middleware_1.s3DeleteImageHelper)(file.key);
        }
        res.status(500).json({ errors: error.message });
    }
});
exports.updateUser = updateUser;
const deleteUser = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const userId = req.params.userId;
        let user = await user_1.default.findByIdAndDelete(userId);
        if (user === null || user === void 0 ? void 0 : user.image.key) {
            console.log(user.image.key);
            (0, middleware_1.s3DeleteImageHelper)(user.image.key);
        }
        res.status(200).json({
            data: null,
            message: "User has been deleted",
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteUser = deleteUser;
//# sourceMappingURL=user.js.map
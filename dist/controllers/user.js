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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.revokePermission = exports.deleteUser = exports.loginUser = exports.updateUser = exports.createNewUser = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const sendMail_1 = require("../services/sendMail");
const middleware_1 = require("../middleware");
const permission_1 = __importDefault(require("../models/permission"));
const activity_1 = require("./activity");
const utils_1 = require("../utils");
const team_1 = __importDefault(require("../models/team"));
const record_1 = __importDefault(require("../models/record"));
const activity_2 = __importDefault(require("../models/activity"));
const privateKey = process.env.PRIVATE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
//generating token
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ _id: id }, privateKey, {
        expiresIn: 60 * 60 * 48,
    });
};
//hashing password
const hashingPassword = async (password) => {
    const salt = await bcrypt_1.default.genSalt(10);
    return await bcrypt_1.default.hash(password, salt);
};
//create new users
const createNewUser = (0, express_async_handler_1.default)(async (req, res) => {
    let file = req.file;
    try {
        const userData = req.body;
        let password = (0, utils_1.generatePassword)();
        userData.password = await hashingPassword(password);
        if (file) {
            let image = {
                key: file.key,
                url: file.location,
                name: file.originalname,
            };
            userData.image = image;
        }
        if (userData.team) {
            let team = team_1.default.findById(userData.team);
            if (!team) {
                throw new Error("Team not found");
            }
        }
        //checkand for admin role and creating one if it does not exist
        if (adminEmail === userData.email) {
            let newPermission = await permission_1.default.create({
                name: "admin",
                roles: ["read", "create", "edit", "delete"],
            });
            userData.permission = newPermission._id;
        }
        const user = await user_1.default.create(userData);
        // send email to user that was just created with his or her password
        await (0, sendMail_1.sendEmail)("User created", user.email, `your account has been created and your password is : <strong>${password}</strong>`);
        if (req.user) {
            (0, activity_1.createActivity)("New Staff created", req.user._id);
        }
        res.status(200).json({ message: "user created successfully" });
    }
    catch (error) {
        if (file) {
            (0, middleware_1.s3DeleteImageHelper)(file.key);
        }
        if (error.code === 11000) {
            // duplicate key error
            res
                .status(409)
                .json({ message: "user already exists with these email" });
        }
        else {
            res.status(500).json({ message: error.message });
        }
    }
});
exports.createNewUser = createNewUser;
const loginUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const user = (await user_1.default.findOne({ email }));
    if (!user) {
        res.status(400).json({ error: "Wrong credentials please try again" });
    }
    else {
        const comparedPass = await bcrypt_1.default.compare(password, user.password);
        if (!comparedPass) {
            res.status(400).json({ error: "Wrong credentials please try again" });
        }
        else {
            const token = generateToken(user._id);
            if (user.permission) {
                (0, activity_1.createActivity)(`${user.email} logged in`, user._id);
            }
            await user_1.default.findByIdAndUpdate({ _id: user._id }, { last_login: Date.now() });
            let _a = user._doc, { password } = _a, userData = __rest(_a, ["password"]);
            res.status(200).json(Object.assign(Object.assign({}, userData), { token, permission: user.permission }));
        }
    }
});
exports.loginUser = loginUser;
const changePassword = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    try {
        const user = await user_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        if (!user)
            throw new Error("User does not exist");
        let { newPassword, oldPassword } = req.body;
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
        (0, sendMail_1.sendEmail)("Password Change", user === null || user === void 0 ? void 0 : user.email, `You have successfully changed your password`);
        res.status(200).json({ message: "Password reset successful" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.changePassword = changePassword;
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
//updating user
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
        if (updateData.team) {
            let team = team_1.default.findById(updateData.team);
            if (!team) {
                throw new Error("Team not found");
            }
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
        let updatedUser = await user_1.default.findByIdAndUpdate({ _id: id }, updateData, {
            new: true,
        }).select("-password");
        (0, activity_1.createActivity)(`${updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.email} was updated`, req.user._id);
        res.status(200).json(updatedUser);
    }
    catch (error) {
        if (file) {
            (0, middleware_1.s3DeleteImageHelper)(file.key);
        }
        res.status(500).json({ errors: error.message });
    }
});
exports.updateUser = updateUser;
//revoking users permission
const revokePermission = (0, express_async_handler_1.default)(async (req, res) => {
    var _a, _b;
    let userId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.userId;
    let permissionId = (_b = req.params) === null || _b === void 0 ? void 0 : _b.permissionId;
    try {
        const user = await user_1.default.findById(userId);
        if (!user)
            throw new Error("user not found");
        const permission = permission_1.default.findById(permissionId);
        if (!permission)
            throw new Error("perssmission does not exist");
        let updateData = {
            permission: null,
        };
        let updatedUser = await user_1.default.findByIdAndUpdate({ _id: userId }, updateData, {
            new: true,
        });
        (0, activity_1.createActivity)(`${updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.email} permssion was revoked`, req.user._id);
        res.status(200).json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ errors: error.message });
    }
});
exports.revokePermission = revokePermission;
//delete users
const deleteUser = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const userId = req.params.userId;
        let user = await user_1.default.findOneAndRemove({ _id: userId });
        if (user === null || user === void 0 ? void 0 : user.image.key) {
            (0, middleware_1.s3DeleteImageHelper)(user.image.key);
        }
        //converting usersid to string to avoid error when using .populate()
        // await RecordModel.updateMany(
        //   { user: userId },
        //   { $unset: { user: "" } }
        // ).lean();
        //another option to completely remove the users record
        await record_1.default.deleteMany({ user: userId });
        //complete remove the users activity
        await activity_2.default.deleteMany({ user: userId });
        //complete remove the users from being a member of a team
        await team_1.default.updateMany({ members: userId }, { $pull: { members: userId } });
        //set the lead in a team to string to avoid error when using .populate()
        // await TeamModel.updateMany( { lead: userId }, { $unset: { lead: "" } });
        (0, activity_1.createActivity)(`${user === null || user === void 0 ? void 0 : user.email} was deleted`, req.user._id);
        res.status(200).json({
            message: "User has been deleted",
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteUser = deleteUser;
//# sourceMappingURL=user.js.map
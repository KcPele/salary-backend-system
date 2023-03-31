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
exports.permissionMiddleware = exports.tokenMiddleware = exports.upload = exports.s3DeleteImageHelper = exports.s3Config = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv = __importStar(require("dotenv"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_s3_1 = __importDefault(require("multer-s3"));
const user_1 = __importDefault(require("../models/user"));
const permission_1 = __importDefault(require("../models/permission"));
dotenv.config();
// aws config
exports.s3Config = new client_s3_1.S3Client({
    region: process.env.S3_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_ACCESS_SECRET,
    },
});
// aws s3 bucket config
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_ACCESS_SECRET,
    region: process.env.S3_BUCKET_REGION,
});
//delete helper function for removing images from aws bucket
const s3DeleteImageHelper = (key) => {
    s3.deleteObject({
        Bucket: process.env.S3_BUCKET,
        Key: key,
    }, (err, data) => {
        if (err) {
            console.error("err", err);
        }
    });
};
exports.s3DeleteImageHelper = s3DeleteImageHelper;
//multer config: handling file uplaod
exports.upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: exports.s3Config,
        bucket: process.env.S3_BUCKET,
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, "images/" + Date.now().toString() + "-" + file.originalname);
        },
    }),
});
//for checking validity of token
const tokenMiddleware = async (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    try {
        const userId = jsonwebtoken_1.default.verify(token, process.env.PRIVATE_KEY);
        let user = await user_1.default.findById(userId === null || userId === void 0 ? void 0 : userId._id);
        if (!user) {
            res.status(400).json({ error: "wrong credentials" });
        }
        else {
            req.user = user;
            next();
        }
    }
    catch (error) {
        let errors = error;
        res.status(500).json({ error: errors.message });
    }
};
exports.tokenMiddleware = tokenMiddleware;
//for checking if user has the required permission
const permissionMiddleware = (permissions) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            const userRoles = await permission_1.default.findById(user.permission);
            // check if the user has at least one of the required permissions
            const hasPermission = permissions.every((permission) => userRoles === null || userRoles === void 0 ? void 0 : userRoles.roles.includes(permission));
            if (!hasPermission) {
                return res.status(403).json({
                    message: "You do not have enough permmsion to perform this action",
                });
            }
            // if the user has the required permission, allow access to the protected route
            return next();
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
};
exports.permissionMiddleware = permissionMiddleware;
//# sourceMappingURL=index.js.map
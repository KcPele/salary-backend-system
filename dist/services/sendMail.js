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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer = __importStar(require("nodemailer"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const SMTP_EMAIL = process.env.SMTP_EMAIL;
function sendEmail(subject, recipient, body) {
    return new Promise(async (resolve, reject) => {
        try {
            // Create a transporter using SMTP
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: SMTP_EMAIL,
                    pass: process.env.SMTP_PASSWORD,
                },
            });
            // Create the email message
            const message = {
                from: SMTP_EMAIL,
                to: recipient,
                subject: subject,
                text: body,
            };
            // Send the email
            await transporter.sendMail(message);
            resolve(`Email sent to ${recipient}`);
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.sendEmail = sendEmail;
//# sourceMappingURL=sendMail.js.map
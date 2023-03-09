import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config();
const SMTP_EMAIL = process.env.SMTP_EMAIL as string;
export function sendEmail(
  subject: string,
  recipient: string,
  body: string
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a transporter using SMTP
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD as string,
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
    } catch (error) {
      reject(error);
    }
  });
}

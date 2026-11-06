import nodemailer, { type Transporter } from "nodemailer";
import {env} from "../config/env.validation.js"

let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    pool:true,
    auth: { user: env.GMAIL_USER!, pass: env.GMAIL_PASS! },
  });
  return transporter;
}


export async function sendEmail(email: string, otp: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Verification Code</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 0;
            color: #333333;
          }
          .email-wrapper {
            width: 100%;
            background-color: #f4f6f8;
            padding: 40px 0;
          }
          .email-container {
            max-width: 480px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }
          .email-header {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            padding: 24px;
            text-align: center;
            color: #ffffff;
          }
          .email-header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          .email-body {
            padding: 32px 24px;
            text-align: center;
          }
          .email-body p {
            margin: 0 0 20px 0;
            font-size: 15px;
            line-height: 1.5;
            color: #4b5563;
          }
          .otp-box {
            background-color: #f8fafc;
            border: 2px dashed #cbd5e1;
            border-radius: 6px;
            padding: 16px;
            margin: 24px 0;
            letter-spacing: 6px;
            font-size: 32px;
            font-weight: 700;
            color: #1e293b;
            font-family: monospace;
          }
          .email-footer {
            padding: 16px 24px;
            background-color: #f8fafc;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>Nova Forge</h1>
            </div>
            <div class="email-body">
              <p>Hello,</p>
              <p>Please use the verification code below to complete your sign-in or registration process on Nova Forge.</p>
              <div class="otp-box">${otp}</div>
              <p>This code will expire in <strong>10 minutes</strong>. If you didn't request this code, you can safely ignore this email.</p>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} Nova Forge. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const info = await getTransporter().sendMail({
    from: `"Nova Forge Support" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your Nova Forge Verification Code",
    html,
  });

  console.log("OTP email sent: %s", info.messageId);
}
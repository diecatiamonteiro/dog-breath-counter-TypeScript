/**
 * @file server/src/services/emailService.ts
 * @description Service for sending email reports with PDF attachment                It styles the email content. It contains the logo that
 *              was previously uploaded to Cloudinary in
 *              server/src/services/cloudinaryService.ts.
 */

import nodemailer from "nodemailer";
import { ReportData } from "./pdfService";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    // Create transporter using App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.GOOGLE_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    });
  } catch (error) {
    console.error("Email service error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new Error(
      `Failed to send email: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const generateEmailHTML = (
  reportData: ReportData,
  recipientEmail: string,
  downloadUrl?: string
): string => {
  const { dog, summary } = reportData;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Nunito&display=swap" rel="stylesheet">
      <title>Breathing Report - ${dog.name}</title>
      <style>
        body {
          font-family: 'Nunito', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: #2d1a44;
          color: #f6f4f9;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .logo {
          align-self: center;
          width:120px;
        }
        .content {
          background: #f8f9fa;
          font-size: 16px;
          padding: 20px;
          border-radius: 0 0 8px 8px;
        }
        .summary-grid {
          display: flex;
          gap: 15px;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: space-between;
        }
        .footer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #666;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${
          process.env.EMAIL_LOGO_URL
        }" alt="Paw Pulse Logo" class="logo">
        <h1>${dog.name}'s Breathing Report</h1>
      </div>

       <div class="content">
        <h2>Hello from Paw Pulse!</h2>
        
        ${
          downloadUrl
            ? `
        <p><strong>${dog.name}</strong>'s breathing report is ready for download.</p>
        
        <p style="text-align: center; margin: 25px 0;">
          <a href="${downloadUrl}" 
             style="background: #2d1a44; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Download PDF Report
          </a>
        </p>
        
        <p style="font-size: 14px; color: #666; text-align: center;">
          <em>This download link expires in 1 hour for security.</em>
        </p>
        `
            : `<p><strong>${dog.name}</strong>'s breathing report is attached to this email.</p>`
        }
      
        <p><strong>Date Range:</strong> ${summary.dateRange}</p>
                
        <div class="footer">
    </body>
    </html>
  `;
};

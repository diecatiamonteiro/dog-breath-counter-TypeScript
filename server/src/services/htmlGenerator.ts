/**
 * @file server/src/services/htmlGenerator.ts
 * @description Service for generating HTML template for PDF reports
 */

import { ReportData } from "./pdfService";

export const generateHTML = (reportData: ReportData): string => {
  const { dog, logs, summary, user } = reportData;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Nunito&display=swap" rel="stylesheet">
      <title>Breathing Report - ${dog.name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Nunito', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8f9fa;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 10px;
        }

        .logo {
          align-self: center;
          width:120px;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #5c3680;
          padding-bottom: 20px;
          margin-bottom: 5px;
        }
        
        .header h1 {
          color: #5c3680;
          font-size: 28px;
        }
        
        .header p {
          color: #666;
          font-size: 14px;
        }
        
        .dog-info {
          background:#d8c7e9;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .dog-info h2 {
          color: #5c3680;
          margin-bottom: 15px;
          font-size: 20px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .info-item {
          background: white;
          padding: 10px;
          border-radius: 6px;
          border-left: 4px solid #5c3680;
        }
        
        .info-label {
          font-weight: 600;
          color: #666;
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .info-value {
          font-size: 16px;
          color: #333;
        }
        
        .summary {
          background: #d8c7e9;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .summary h2 {
          color: #5c3680;
          margin-bottom: 5px;
          font-size: 20px;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 15px;
        }
        
        .summary-item {
          text-align: center;
          background: white;
          padding: 5px;
          border-radius: 6px;
        }
        
        .summary-value {
          font-size: 23px;
          font-weight: bold;
          color: #5c3680;
        }
        
        .summary-label {
          font-size: 14px;
          color: #666;
        }
        
        .logs-section h2 {
          color: #5c3680;
          margin-bottom: 20px;
          font-size: 20px;
        }
        
        .logs-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        .logs-table th {
          background: #5c3680;
          color: white;
          padding: 6px;
          text-align: left;
          font-weight: 600;
        }
        
        .logs-table td {
          padding: 6px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .logs-table tr:nth-child(even) {
          background: #f9fafb;
        }
        
        .bpm-cell {
          font-weight: 600;
          color: #5c3680;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${
            process.env.EMAIL_LOGO_URL
          }" alt="Paw Pulse Logo" class="logo">
          <h1>Breathing Report</h1>
          <p>Generated on ${new Date().toLocaleDateString("en-UK", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}</p>
        </div>
        <p style="margin-left: 1px; margin-bottom: 20px;">BPM = Breaths Per Minute</p>
        <div class="dog-info">
          <h2>Dog Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Name</div>
              <div class="info-value">${dog.name}</div>
            </div>
            ${
              dog.breed
                ? `
              <div class="info-item">
                <div class="info-label">Breed</div>
                <div class="info-value">${dog.breed}</div>
              </div>
            `
                : ""
            }
            ${
              dog.age
                ? `
              <div class="info-item">
                <div class="info-label">Age</div>
                <div class="info-value">${dog.age} years</div>
              </div>
            `
                : ""
            }
            <div class="info-item">
              <div class="info-label">Max Breathing Rate</div>
              <div class="info-value">${dog.maxBreathingRate} BPM</div>
            </div>
          </div>
        </div>
        
        <div class="summary">
          <h2>Report Summary</h2>
           <div style="margin-bottom: 15px; text-align: left; color: #666;">
            <strong>Date Range:</strong> ${summary.dateRange}
          </div>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${summary.totalLogs}</div>
              <div class="summary-label">Total Logs</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${summary.averageBPM.toFixed(1)}</div>
              <div class="summary-label">Average BPM</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${summary.lowestBPM}</div>
              <div class="summary-label">Lowest BPM</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${summary.highestBPM}</div>
              <div class="summary-label">Highest BPM</div>
            </div>
          </div>
         
        </div>
        
        <div class="logs-section">
          <h2>Breathing Logs</h2>
          <table class="logs-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>BPM</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              ${logs
                .map(
                  (log) => `
                <tr>
                  <td>${log.date}</td>
                  <td>${log.time}</td>
                  <td class="bpm-cell">${log.bpm}</td>
                  <td>${log.comment || "-"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <div>This report was generated by PawPulse for</div>
          <div>${user.firstName} ${user.lastName} (${user.email}).</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

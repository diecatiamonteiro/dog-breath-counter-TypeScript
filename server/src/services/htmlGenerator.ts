/**
 * @file htmlGenerator.ts
 * @description Service for generating HTML template for PDF reports
 */

import { ReportData } from './pdfService';

export const generateHTML = (reportData: ReportData): string => {
  const { dog, logs, summary, user } = reportData;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Breathing Report - ${dog.name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8f9fa;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #4f46e5;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          color: #4f46e5;
          font-size: 28px;
          margin-bottom: 10px;
        }
        
        .header p {
          color: #666;
          font-size: 16px;
        }
        
        .dog-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .dog-info h2 {
          color: #4f46e5;
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
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #4f46e5;
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
          background: #e0e7ff;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .summary h2 {
          color: #4f46e5;
          margin-bottom: 15px;
          font-size: 20px;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }
        
        .summary-item {
          text-align: center;
          background: white;
          padding: 15px;
          border-radius: 6px;
        }
        
        .summary-value {
          font-size: 24px;
          font-weight: bold;
          color: #4f46e5;
          margin-bottom: 5px;
        }
        
        .summary-label {
          font-size: 14px;
          color: #666;
        }
        
        .logs-section h2 {
          color: #4f46e5;
          margin-bottom: 20px;
          font-size: 20px;
        }
        
        .logs-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        .logs-table th {
          background: #4f46e5;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        
        .logs-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .logs-table tr:nth-child(even) {
          background: #f9fafb;
        }
        
        .bpm-cell {
          font-weight: 600;
          color: #4f46e5;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #666;
          font-size: 14px;
        }
        
        .generated-by {
          margin-top: 10px;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🐕 Breathing Report</h1>
          <p>Generated on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
        
        <div class="dog-info">
          <h2>Dog Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Name</div>
              <div class="info-value">${dog.name}</div>
            </div>
            ${dog.breed ? `
              <div class="info-item">
                <div class="info-label">Breed</div>
                <div class="info-value">${dog.breed}</div>
              </div>
            ` : ''}
            ${dog.age ? `
              <div class="info-item">
                <div class="info-label">Age</div>
                <div class="info-value">${dog.age} years</div>
              </div>
            ` : ''}
            <div class="info-item">
              <div class="info-label">Max Breathing Rate</div>
              <div class="info-value">${dog.maxBreathingRate} BPM</div>
            </div>
          </div>
        </div>
        
        <div class="summary">
          <h2>Report Summary</h2>
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
          <div style="margin-top: 15px; text-align: center; color: #666;">
            <strong>Date Range:</strong> ${summary.dateRange}
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
                <th>Breath Count</th>
                <th>Duration</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(log => `
                <tr>
                  <td>${log.date}</td>
                  <td>${log.time}</td>
                  <td class="bpm-cell">${log.bpm}</td>
                  <td>${log.breathCount}</td>
                  <td>${log.duration}s</td>
                  <td>${log.comment || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <div>This report was generated by PawPulse Breathing Monitor</div>
          <div class="generated-by">Generated for ${user.firstName} ${user.lastName} (${user.email})</div>
        </div>
      </div>
    </body>
    </html>
  `;
}; 
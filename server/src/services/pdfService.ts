/**
 * @file pdfService.ts
 * @description Service for generating PDF reports from HTML content (breathing log data)
 *              Uses generateHTML() from htmlGenerator.ts to generate the HTML content
 */

import { generateHTML } from "./htmlGenerator";
// @ts-ignore - html-pdf-node doesn't have TypeScript declarations
import htmlPdf from "html-pdf-node";

export interface ReportData {
  dog: {
    name: string;
    breed?: string;
    age?: number;
    maxBreathingRate: number;
  };
  logs: Array<{
    date: string;
    time: string;
    bpm: number;
    breathCount: number;
    duration: number;
    comment?: string;
  }>;
  summary: {
    totalLogs: number;
    averageBPM: number;
    lowestBPM: number;
    highestBPM: number;
    dateRange: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const generatePDF = async (reportData: ReportData): Promise<Buffer> => {
  try {
    // Generate HTML content
    const htmlContent = generateHTML(reportData);

    // Configure PDF options
    const options = {
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        right: "18mm",
        bottom: "18mm",
        left: "10mm",
      },
    };

    // Generate PDF using html-pdf-node
    const file = { content: htmlContent };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);

    // Convert Uint8Array to Buffer
    return Buffer.from(pdfBuffer);
  } catch (error) {
    throw new Error(
      `Failed to generate PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

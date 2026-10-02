import * as XLSX from 'xlsx';
import { MedicalRecord } from '../types/medicalCost';

export function exportMedicalRecordsToXlsx(
  records: MedicalRecord[],
  filenamePrefix: string = 'Medical_Cost_Submission'
) {
  if (!records || records.length === 0) {
    throw new Error('No records available to export.');
  }

  // Calculate totals
  const totalSubTotal = records.reduce((acc, r) => acc + (Number(r.subTotal) || 0), 0);
  const totalGST = records.reduce((acc, r) => acc + (Number(r.gst) || 0), 0);
  const totalGrandTotal = records.reduce((acc, r) => acc + (Number(r.grandTotal) || 0), 0);

  // Format data rows
  const rows = records.map((record, index) => ({
    'No.': index + 1,
    'Name of Employee': record.employeeName || 'N/A',
    'Clinic Name': record.clinicName || 'N/A',
    'Date': record.date || '',
    'Receipt / Invoice #': record.invoiceNumber || '',
    'Sub-Total': Number(record.subTotal.toFixed(2)),
    'GST': Number(record.gst.toFixed(2)),
    'Grand Total': Number(record.grandTotal.toFixed(2)),
    'Summary of Illness': record.summaryOfIllness || '',
    'Currency': record.currency || '$',
    'Status': record.status.toUpperCase(),
    'Notes / Itemization': record.lineItems && record.lineItems.length > 0
      ? record.lineItems.map(i => `${i.description} (${i.amount})`).join('; ')
      : (record.notes || ''),
  }));

  // Append summary row
  rows.push({
    'No.': 'TOTAL',
    'Name of Employee': `${records.length} claim(s)`,
    'Clinic Name': '',
    'Date': '',
    'Receipt / Invoice #': '',
    'Sub-Total': Number(totalSubTotal.toFixed(2)),
    'GST': Number(totalGST.toFixed(2)),
    'Grand Total': Number(totalGrandTotal.toFixed(2)),
    'Summary of Illness': '',
    'Currency': '',
    'Status': '',
    'Notes / Itemization': 'End of submission',
  } as any);

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Define column widths for Excel readability
  const colWidths = [
    { wch: 8 },  // No.
    { wch: 24 }, // Name of Employee
    { wch: 28 }, // Clinic Name
    { wch: 14 }, // Date
    { wch: 20 }, // Receipt / Invoice #
    { wch: 14 }, // Sub-Total
    { wch: 12 }, // GST
    { wch: 15 }, // Grand Total
    { wch: 40 }, // Summary of Illness
    { wch: 10 }, // Currency
    { wch: 12 }, // Status
    { wch: 45 }, // Notes / Itemization
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Medical Claims');

  // Also create a Summary Sheet for HR/Finance
  const summaryData = [
    { 'Metric': 'Submission Date', 'Value': new Date().toLocaleDateString() },
    { 'Metric': 'Total Number of Claims', 'Value': records.length },
    { 'Metric': 'Total Sub-Total', 'Value': totalSubTotal.toFixed(2) },
    { 'Metric': 'Total GST Claimed', 'Value': totalGST.toFixed(2) },
    { 'Metric': 'Total Grand Amount Payable', 'Value': totalGrandTotal.toFixed(2) },
    { 'Metric': 'Unique Employees', 'Value': new Set(records.map(r => r.employeeName.trim())).size },
    { 'Metric': 'Unique Clinics', 'Value': new Set(records.map(r => r.clinicName.trim())).size },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');

  // Generate file name with date timestamp
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = new Date().toTimeString().slice(0, 5).replace(/:/g, '');
  const fileName = `${filenamePrefix}_${dateStr}_${timeStr}.xlsx`;

  // Write and trigger download
  XLSX.writeFile(workbook, fileName);
  return fileName;
}

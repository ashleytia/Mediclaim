export interface LineItem {
  description: string;
  amount: number;
}

export interface MedicalRecord {
  id: string;
  // 6 Required Fields
  employeeName: string;      // 1. Name of Employee
  clinicName: string;        // 2. Clinic name
  subTotal: number;          // 3. Sub-Total
  gst: number;               // 4. GST
  grandTotal: number;        // 5. Grand Total
  summaryOfIllness: string;  // 6. Summary of illness

  // Additional Metadata
  date: string;              // YYYY-MM-DD
  invoiceNumber: string;     // Receipt / Bill / Invoice #
  currency: string;          // $, SGD, USD, RM, etc.
  lineItems?: LineItem[];
  notes?: string;
  confidence?: 'high' | 'medium' | 'low';
  receiptImage?: string;     // Base64 or DataURL
  fileName?: string;
  status: 'extracted' | 'manual' | 'edited';
  createdAt: string;
}

export interface ExtractionProgressItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
  result?: MedicalRecord;
}

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { DropZone } from './components/DropZone';
import { RecordTable } from './components/RecordTable';
import { RecordEditModal } from './components/RecordEditModal';
import { ManualAddModal } from './components/ManualAddModal';
import { ReceiptInspectorModal } from './components/ReceiptInspectorModal';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { MedicalRecord } from './types/medicalCost';
import { exportMedicalRecordsToXlsx } from './utils/xlsxExport';
import { generateSampleReceiptImage } from './utils/sampleReceipts';

const STORAGE_KEY = 'mediclaim_records_v1';

export default function App() {
  const [records, setRecords] = useState<MedicalRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load records from localStorage', e);
    }

    // Default initial demonstration record
    const initialSampleImg = generateSampleReceiptImage('sample-1');
    return [
      {
        id: 'initial-sample-01',
        employeeName: 'Tan Wei Ming Marcus',
        clinicName: 'Healthway Medical Family Clinic',
        subTotal: 90.0,
        gst: 8.1,
        grandTotal: 98.1,
        summaryOfIllness: 'Acute Upper Respiratory Tract Infection (URTI) with Fever',
        date: '2026-09-28',
        invoiceNumber: 'INV-2026-09824',
        currency: '$',
        receiptImage: initialSampleImg,
        fileName: 'Healthway_Medical_Invoice.png',
        lineItems: [
          { description: 'Standard Consultation (GP)', amount: 42.0 },
          { description: 'Amoxicillin Trihydrate 500mg', amount: 22.0 },
          { description: 'Paracetamol 500mg Analgesic', amount: 12.0 },
          { description: 'Dextromethorphan Cough Syrup', amount: 14.0 },
        ],
        notes: 'MC 2 days issued, paid via corporate credit card',
        confidence: 'high',
        status: 'extracted',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [inspectingRecord, setInspectingRecord] = useState<MedicalRecord | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save records to localStorage', e);
    }
  }, [records]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // OCR Processing logic
  const handleProcessFiles = async (
    files: { base64: string; mimeType: string; filename: string }[]
  ) => {
    setIsProcessing(true);

    for (const file of files) {
      try {
        const response = await fetch('/api/extract-receipt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageBase64: file.base64,
            mimeType: file.mimeType,
            filename: file.filename,
          }),
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.error || 'Failed to extract medical information');
        }

        const data = json.data;

        const newRecord: MedicalRecord = {
          id: Math.random().toString(36).substring(2, 10),
          employeeName: data.employeeName || 'Unknown Employee',
          clinicName: data.clinicName || 'Unknown Clinic',
          subTotal: Number(data.subTotal) || 0,
          gst: Number(data.gst) || 0,
          grandTotal: Number(data.grandTotal) || 0,
          summaryOfIllness: data.summaryOfIllness || 'Medical Consultation',
          date: data.date || new Date().toISOString().split('T')[0],
          invoiceNumber: data.invoiceNumber || '',
          currency: data.currency || '$',
          receiptImage: file.base64,
          fileName: file.filename,
          lineItems: data.lineItems || [],
          notes: data.notes || '',
          confidence: data.confidence || 'high',
          status: 'extracted',
          createdAt: new Date().toISOString(),
        };

        setRecords((prev) => [newRecord, ...prev]);

        addToast(
          'success',
          'Receipt Extracted Successfully',
          `${newRecord.clinicName} • Total: ${newRecord.currency}${newRecord.grandTotal.toFixed(2)}`
        );
      } catch (err: any) {
        console.error('OCR Extraction error:', err);
        addToast(
          'error',
          `Extraction failed for ${file.filename}`,
          err.message || 'Error occurred while contacting OCR service'
        );
      }
    }

    setIsProcessing(false);
  };

  // Export to Excel (.xlsx)
  const handleExportXlsx = (selectedRecords?: MedicalRecord[]) => {
    const listToExport = selectedRecords && selectedRecords.length > 0 ? selectedRecords : records;

    if (listToExport.length === 0) {
      addToast('info', 'No records to export', 'Please add or extract medical bills first.');
      return;
    }

    setIsExporting(true);
    try {
      const fileName = exportMedicalRecordsToXlsx(listToExport);
      addToast(
        'success',
        'Excel File Downloaded',
        `Successfully exported ${listToExport.length} claim(s) to ${fileName}`
      );
    } catch (err: any) {
      console.error('Export error:', err);
      addToast('error', 'Export Failed', err.message || 'Could not generate XLSX file.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveEditedRecord = (updatedRecord: MedicalRecord) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
    );
    addToast('success', 'Record Updated', `Saved changes for ${updatedRecord.employeeName}`);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    addToast('info', 'Record Deleted', 'The medical claim was removed.');
  };

  const handleDuplicateRecord = (record: MedicalRecord) => {
    const duplicated: MedicalRecord = {
      ...record,
      id: Math.random().toString(36).substring(2, 10),
      invoiceNumber: record.invoiceNumber ? `${record.invoiceNumber}-COPY` : '',
      createdAt: new Date().toISOString(),
      status: 'manual',
    };
    setRecords((prev) => [duplicated, ...prev]);
    addToast('success', 'Record Duplicated', `Created a copy of ${record.clinicName}`);
  };

  const handleAddManualRecord = (record: MedicalRecord) => {
    setRecords((prev) => [record, ...prev]);
    addToast(
      'success',
      'Record Added',
      `${record.employeeName} • ${record.clinicName} ($${record.grandTotal.toFixed(2)})`
    );
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all records from the table?')) {
      setRecords([]);
      addToast('info', 'All records cleared', 'The medical claims table is now empty.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation Header */}
      <Header
        records={records}
        onExportXlsx={() => handleExportXlsx()}
        onOpenManualModal={() => setIsManualModalOpen(true)}
        onClearAll={handleClearAll}
        isExporting={isExporting}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Statistics Cards */}
        <StatsCards records={records} />

        {/* Upload & Drag-and-Drop DropZone */}
        <DropZone onProcessFiles={handleProcessFiles} isProcessing={isProcessing} />

        {/* Medical Cost Claims Table */}
        <RecordTable
          records={records}
          onEditRecord={(record) => setEditingRecord(record)}
          onDeleteRecord={handleDeleteRecord}
          onDuplicateRecord={handleDuplicateRecord}
          onViewReceipt={(record) => setInspectingRecord(record)}
          onExportSelected={(selected) => handleExportXlsx(selected)}
          onOpenManualModal={() => setIsManualModalOpen(true)}
        />
      </main>

      {/* Edit Record Modal */}
      <RecordEditModal
        record={editingRecord}
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        onSave={handleSaveEditedRecord}
      />

      {/* Manual Entry Modal */}
      <ManualAddModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onAddRecord={handleAddManualRecord}
      />

      {/* Receipt Inspector Modal */}
      <ReceiptInspectorModal
        record={inspectingRecord}
        isOpen={Boolean(inspectingRecord)}
        onClose={() => setInspectingRecord(null)}
        onSave={handleSaveEditedRecord}
      />

      {/* Notification Toasts */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

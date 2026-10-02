import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Building,
  User,
  DollarSign,
  Stethoscope,
  Percent,
  Calendar,
  Receipt,
  Save
} from 'lucide-react';
import { MedicalRecord } from '../types/medicalCost';

interface ReceiptInspectorModalProps {
  record: MedicalRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: MedicalRecord) => void;
}

export const ReceiptInspectorModal: React.FC<ReceiptInspectorModalProps> = ({
  record,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !record) return null;

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Editable local state for side-by-side verification
  const [employeeName, setEmployeeName] = useState(record.employeeName);
  const [clinicName, setClinicName] = useState(record.clinicName);
  const [subTotal, setSubTotal] = useState<string>(record.subTotal.toString());
  const [gst, setGst] = useState<string>(record.gst.toString());
  const [grandTotal, setGrandTotal] = useState<string>(record.grandTotal.toString());
  const [summaryOfIllness, setSummaryOfIllness] = useState(record.summaryOfIllness);
  const [date, setDate] = useState(record.date);
  const [invoiceNumber, setInvoiceNumber] = useState(record.invoiceNumber);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleResetView = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleSave = () => {
    const updated: MedicalRecord = {
      ...record,
      employeeName: employeeName.trim(),
      clinicName: clinicName.trim(),
      subTotal: Math.max(0, parseFloat(subTotal) || 0),
      gst: Math.max(0, parseFloat(gst) || 0),
      grandTotal: Math.max(0, parseFloat(grandTotal) || 0),
      summaryOfIllness: summaryOfIllness.trim(),
      date: date.trim(),
      invoiceNumber: invoiceNumber.trim(),
      status: 'edited',
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Receipt Verification & OCR Inspector
                <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Side-by-Side Review
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Compare original receipt image with extracted metadata
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Split Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left Side: Receipt Image Viewer (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/95 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 relative">
            {/* Viewer Controls */}
            <div className="p-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-white text-xs shrink-0 z-10">
              <span className="text-slate-400 font-mono text-[11px] truncate max-w-[200px]">
                {record.fileName || 'medical_receipt.png'}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="Rotate 90deg"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetView}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="Reset Zoom & Rotation"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                {record.receiptImage && (
                  <a
                    href={record.receiptImage}
                    download={`Receipt_${record.employeeName || 'claim'}.png`}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white ml-1"
                    title="Download Receipt Image"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Image Canvas / Viewport */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[300px]">
              {record.receiptImage ? (
                <div
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="max-w-full shadow-2xl rounded-sm overflow-hidden"
                >
                  <img
                    src={record.receiptImage}
                    alt="Receipt inspection"
                    className="max-h-[75vh] w-auto object-contain select-none"
                  />
                </div>
              ) : (
                <div className="text-slate-500 text-center py-12">
                  <Receipt className="w-12 h-12 stroke-1 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No image was attached for this manual entry.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Extracted Fields Review (5 cols) */}
          <div className="lg:col-span-5 bg-white flex flex-col min-h-0 overflow-y-auto">
            <div className="p-5 space-y-4 flex-1">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Extracted Information
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  OCR Verified
                </span>
              </div>

              {/* 1. Name of Employee */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  1. Name of Employee
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* 2. Clinic Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-teal-600" />
                  2. Clinic Name
                </label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Date & Invoice */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Invoice #
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Amounts: 3. Sub-Total, 4. GST, 5. Grand Total */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Amounts (SGD / Detected Currency)
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      3. Sub-Total
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={subTotal}
                      onChange={(e) => setSubTotal(e.target.value)}
                      className="w-full px-2 py-1 text-xs font-mono font-bold rounded border border-slate-300 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      4. GST
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={gst}
                      onChange={(e) => setGst(e.target.value)}
                      className="w-full px-2 py-1 text-xs font-mono font-bold rounded border border-slate-300 text-amber-900 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-800 mb-1">
                      5. Grand Total
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={grandTotal}
                      onChange={(e) => setGrandTotal(e.target.value)}
                      className="w-full px-2 py-1 text-xs font-mono font-black rounded border border-emerald-400 bg-emerald-50/50 text-emerald-900 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Summary of Illness */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  6. Summary of Illness
                </label>
                <textarea
                  rows={3}
                  value={summaryOfIllness}
                  onChange={(e) => setSummaryOfIllness(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-normal"
                />
              </div>

              {/* Itemized line items if detected */}
              {record.lineItems && record.lineItems.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                    Itemized Services / Medications ({record.lineItems.length}):
                  </span>
                  <div className="bg-slate-50 rounded-lg border border-slate-200 divide-y divide-slate-200 text-xs">
                    {record.lineItems.map((item, idx) => (
                      <div key={idx} className="p-2 flex items-center justify-between">
                        <span className="text-slate-700 text-[11px]">{item.description}</span>
                        <span className="font-mono font-semibold text-slate-800 text-[11px]">
                          ${Number(item.amount || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Save Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Plus, Calculator, Building, User, DollarSign, Stethoscope, Upload } from 'lucide-react';
import { MedicalRecord } from '../types/medicalCost';

interface ManualAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (record: MedicalRecord) => void;
}

export const ManualAddModal: React.FC<ManualAddModalProps> = ({
  isOpen,
  onClose,
  onAddRecord,
}) => {
  if (!isOpen) return null;

  const [employeeName, setEmployeeName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [subTotal, setSubTotal] = useState('');
  const [gst, setGst] = useState('0.00');
  const [grandTotal, setGrandTotal] = useState('');
  const [summaryOfIllness, setSummaryOfIllness] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);

  const handleAutoCalcGst = (rate: number = 0.09) => {
    const sub = parseFloat(subTotal) || 0;
    const computedGst = +(sub * rate).toFixed(2);
    setGst(computedGst.toFixed(2));
    setGrandTotal((sub + computedGst).toFixed(2));
  };

  const handleAutoCalcGrandTotal = () => {
    const sub = parseFloat(subTotal) || 0;
    const g = parseFloat(gst) || 0;
    setGrandTotal((sub + g).toFixed(2));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const sub = Math.max(0, parseFloat(subTotal) || 0);
    const g = Math.max(0, parseFloat(gst) || 0);
    const grand = Math.max(0, parseFloat(grandTotal) || (sub + g));

    const newRecord: MedicalRecord = {
      id: Math.random().toString(36).substring(2, 10),
      employeeName: employeeName.trim() || 'Employee',
      clinicName: clinicName.trim() || 'Medical Clinic',
      subTotal: sub,
      gst: g,
      grandTotal: grand,
      summaryOfIllness: summaryOfIllness.trim() || 'General Medical Consultation',
      date: date.trim() || new Date().toISOString().split('T')[0],
      invoiceNumber: invoiceNumber.trim() || `MAN-${Date.now().toString().slice(-5)}`,
      currency: '$',
      receiptImage,
      notes: notes.trim(),
      status: 'manual',
      createdAt: new Date().toISOString(),
    };

    onAddRecord(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-slate-800">Add Medical Claim Record</h3>
            <p className="text-xs text-slate-500">
              Input medical claim details manually into the submission table
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* 1. Name of Employee */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              1. Name of Employee <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="e.g. Tan Wei Ming Marcus"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>

          {/* 2. Clinic Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-teal-600" />
              2. Clinic Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="e.g. Healthway Medical Family Clinic"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Date & Invoice # */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Consultation Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Receipt / Invoice #
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="e.g. INV-2026-0012"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* 3. Sub-Total, 4. GST, 5. Grand Total */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Financial Breakdown
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAutoCalcGst(0.09)}
                  className="px-2 py-0.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100"
                >
                  Calc 9% GST
                </button>
                <button
                  type="button"
                  onClick={handleAutoCalcGrandTotal}
                  className="px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 flex items-center gap-1"
                >
                  <Calculator className="w-3 h-3" />
                  Auto-Sum
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  3. Sub-Total ($) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={subTotal}
                  onChange={(e) => setSubTotal(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  4. GST ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-amber-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                  5. Grand Total ($) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={grandTotal}
                  onChange={(e) => setGrandTotal(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-black rounded-lg border border-emerald-400 bg-emerald-50/50 text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 6. Summary of Illness */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              6. Summary of Illness / Diagnosis <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={summaryOfIllness}
              onChange={(e) => setSummaryOfIllness(e.target.value)}
              placeholder="e.g. Acute Upper Respiratory Tract Infection (URTI) with Fever and Sore Throat."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed font-normal"
            />
          </div>

          {/* Optional Receipt Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              Attach Receipt Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
            {receiptImage && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={receiptImage}
                  alt="Receipt Preview"
                  className="w-12 h-14 object-cover rounded border border-slate-200"
                />
                <span className="text-xs text-emerald-600 font-medium">Image attached</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Remarks (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Corporate medical claim, 2 days MC"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-600"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Record to Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

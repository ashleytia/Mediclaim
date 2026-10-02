import React, { useState, useEffect } from 'react';
import { X, Save, Calculator, AlertCircle, Building, User, DollarSign, Stethoscope } from 'lucide-react';
import { MedicalRecord } from '../types/medicalCost';

interface RecordEditModalProps {
  record: MedicalRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRecord: MedicalRecord) => void;
}

export const RecordEditModal: React.FC<RecordEditModalProps> = ({
  record,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !record) return null;

  const [employeeName, setEmployeeName] = useState(record.employeeName);
  const [clinicName, setClinicName] = useState(record.clinicName);
  const [subTotal, setSubTotal] = useState<string>(record.subTotal.toString());
  const [gst, setGst] = useState<string>(record.gst.toString());
  const [grandTotal, setGrandTotal] = useState<string>(record.grandTotal.toString());
  const [summaryOfIllness, setSummaryOfIllness] = useState(record.summaryOfIllness);
  const [date, setDate] = useState(record.date);
  const [invoiceNumber, setInvoiceNumber] = useState(record.invoiceNumber);
  const [notes, setNotes] = useState(record.notes || '');

  useEffect(() => {
    if (record) {
      setEmployeeName(record.employeeName);
      setClinicName(record.clinicName);
      setSubTotal(record.subTotal.toString());
      setGst(record.gst.toString());
      setGrandTotal(record.grandTotal.toString());
      setSummaryOfIllness(record.summaryOfIllness);
      setDate(record.date);
      setInvoiceNumber(record.invoiceNumber);
      setNotes(record.notes || '');
    }
  }, [record]);

  const handleAutoCalcGrandTotal = () => {
    const sub = parseFloat(subTotal) || 0;
    const g = parseFloat(gst) || 0;
    setGrandTotal((sub + g).toFixed(2));
  };

  const handleAutoCalcGst = (rate: number = 0.09) => {
    const sub = parseFloat(subTotal) || 0;
    const computedGst = +(sub * rate).toFixed(2);
    setGst(computedGst.toFixed(2));
    setGrandTotal((sub + computedGst).toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: MedicalRecord = {
      ...record,
      employeeName: employeeName.trim() || 'Unknown Employee',
      clinicName: clinicName.trim() || 'Unknown Clinic',
      subTotal: Math.max(0, parseFloat(subTotal) || 0),
      gst: Math.max(0, parseFloat(gst) || 0),
      grandTotal: Math.max(0, parseFloat(grandTotal) || 0),
      summaryOfIllness: summaryOfIllness.trim() || 'General Medical Consultation',
      date: date.trim(),
      invoiceNumber: invoiceNumber.trim(),
      notes: notes.trim(),
      status: 'edited',
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-slate-800">Edit Medical Record</h3>
            <p className="text-xs text-slate-500">
              Update extracted fields or rectify any OCR discrepancies
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
              placeholder="e.g. John Tan / Sarah Jenkins"
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
              placeholder="e.g. Raffles Medical / Prime Dental Clinic"
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
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="YYYY-MM-DD"
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
                placeholder="e.g. INV-2026-9810"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Financials: 3. Sub-Total, 4. GST, 5. Grand Total */}
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
                  title="Compute 9% GST automatically"
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
              {/* 3. Sub-Total */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  3. Sub-Total ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={subTotal}
                  onChange={(e) => setSubTotal(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* 4. GST */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  4. GST ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-amber-900"
                />
              </div>

              {/* 5. Grand Total */}
              <div>
                <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                  5. Grand Total ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
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
              placeholder="e.g. Acute Pharyngitis with High Fever; Consultation and antibiotic course prescribed."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed font-normal"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Remarks / Itemized Details (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. MC 2 days, paid by corporate VISA"
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
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

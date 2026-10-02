import React from 'react';
import { FileSpreadsheet, PlusCircle, Trash2, Receipt, ShieldCheck } from 'lucide-react';
import { MedicalRecord } from '../types/medicalCost';

interface HeaderProps {
  records: MedicalRecord[];
  onExportXlsx: () => void;
  onOpenManualModal: () => void;
  onClearAll: () => void;
  isExporting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  records,
  onExportXlsx,
  onOpenManualModal,
  onClearAll,
  isExporting = false,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-4 ring-emerald-50">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  MediClaim <span className="text-emerald-600">OCR</span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Smart OCR
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Medical Cost Submission & Expense Claim Extraction
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenManualModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-2xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-500" />
              Manual Entry
            </button>

            {records.length > 0 && (
              <button
                onClick={onClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                title="Clear all records"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}

            <button
              onClick={onExportXlsx}
              disabled={records.length === 0 || isExporting}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer ${
                records.length > 0 && !isExporting
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 ring-2 ring-emerald-600/20 active:scale-98'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel (.xlsx)</span>
              {records.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-800/40 text-emerald-100">
                  {records.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

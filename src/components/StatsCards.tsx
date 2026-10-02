import React from 'react';
import { DollarSign, ReceiptText, Users, Building2, Percent } from 'lucide-react';
import { MedicalRecord } from '../types/medicalCost';

interface StatsCardsProps {
  records: MedicalRecord[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ records }) => {
  const totalSubTotal = records.reduce((acc, r) => acc + (Number(r.subTotal) || 0), 0);
  const totalGST = records.reduce((acc, r) => acc + (Number(r.gst) || 0), 0);
  const totalGrandTotal = records.reduce((acc, r) => acc + (Number(r.grandTotal) || 0), 0);

  const uniqueEmployees = new Set(
    records.map((r) => r.employeeName.trim().toLowerCase()).filter(Boolean)
  ).size;

  const uniqueClinics = new Set(
    records.map((r) => r.clinicName.trim().toLowerCase()).filter(Boolean)
  ).size;

  const currencySymbol = records.length > 0 && records[0].currency ? records[0].currency : '$';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {/* Total Claims Count */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Claims</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ReceiptText className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900">{records.length}</span>
          <span className="text-xs text-slate-500 font-medium">record{records.length === 1 ? '' : 's'}</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          Ready for Excel export
        </div>
      </div>

      {/* Sub-Total */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Sub-Total</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-semibold text-slate-400">{currencySymbol}</span>
          <span className="text-2xl font-extrabold text-slate-800">
            {totalSubTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          Pre-tax medical fees
        </div>
      </div>

      {/* GST Amount */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total GST</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Percent className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-semibold text-slate-400">{currencySymbol}</span>
          <span className="text-2xl font-extrabold text-amber-900">
            {totalGST.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-amber-700/80 font-medium">
          Tax reclaimable
        </div>
      </div>

      {/* Grand Total */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white shadow-sm shadow-emerald-500/15">
        <div className="flex items-center justify-between text-emerald-100 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">Grand Total</span>
          <div className="w-7 h-7 rounded-lg bg-white/20 text-white flex items-center justify-center backdrop-blur-xs">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-semibold text-emerald-200">{currencySymbol}</span>
          <span className="text-2xl font-black text-white">
            {totalGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-emerald-100 font-medium">
          Total claim amount
        </div>
      </div>

      {/* Breakdown count */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Directory</span>
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center justify-around pt-1">
          <div className="text-center">
            <span className="text-lg font-bold text-slate-800">{uniqueEmployees}</span>
            <span className="block text-[10px] text-slate-400 font-medium">Employees</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="text-center">
            <span className="text-lg font-bold text-slate-800">{uniqueClinics}</span>
            <span className="block text-[10px] text-slate-400 font-medium">Clinics</span>
          </div>
        </div>
      </div>
    </div>
  );
};

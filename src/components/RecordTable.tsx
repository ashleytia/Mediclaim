import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Eye,
  Copy,
  Receipt,
  Stethoscope,
  Building,
  User,
  Plus,
  HelpCircle,
  FileDown
} from 'lucide-react';
import { MedicalRecord } from '../types/medicalCost';

interface RecordTableProps {
  records: MedicalRecord[];
  onEditRecord: (record: MedicalRecord) => void;
  onDeleteRecord: (id: string) => void;
  onDuplicateRecord: (record: MedicalRecord) => void;
  onViewReceipt: (record: MedicalRecord) => void;
  onExportSelected: (selectedRecords: MedicalRecord[]) => void;
  onOpenManualModal: () => void;
}

type SortField = 'employeeName' | 'clinicName' | 'date' | 'subTotal' | 'gst' | 'grandTotal' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export const RecordTable: React.FC<RecordTableProps> = ({
  records,
  onEditRecord,
  onDeleteRecord,
  onDuplicateRecord,
  onViewReceipt,
  onExportSelected,
  onOpenManualModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filtered and Sorted records
  const filteredRecords = useMemo(() => {
    let result = [...records];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(q) ||
          r.clinicName.toLowerCase().includes(q) ||
          r.summaryOfIllness.toLowerCase().includes(q) ||
          r.invoiceNumber.toLowerCase().includes(q) ||
          r.date.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'subTotal' || sortField === 'gst' || sortField === 'grandTotal') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [records, searchTerm, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredRecords.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Delete ${selectedIds.size} selected record(s)?`)) {
      selectedIds.forEach((id) => onDeleteRecord(id));
      setSelectedIds(new Set());
    }
  };

  const handleExportSelected = () => {
    const selectedList = records.filter((r) => selectedIds.has(r.id));
    onExportSelected(selectedList);
  };

  // Totals for filtered records
  const totalSub = filteredRecords.reduce((acc, r) => acc + (Number(r.subTotal) || 0), 0);
  const totalGst = filteredRecords.reduce((acc, r) => acc + (Number(r.gst) || 0), 0);
  const totalGrand = filteredRecords.reduce((acc, r) => acc + (Number(r.grandTotal) || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              Submitted Medical Claims
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
              {records.length}
            </span>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-300">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                {selectedIds.size} selected
              </span>
              <button
                onClick={handleExportSelected}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-white border border-emerald-300 rounded-md hover:bg-emerald-50 transition-colors"
                title="Export selected rows to Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Export Selected
              </button>
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-white border border-rose-300 rounded-md hover:bg-rose-50 transition-colors"
                title="Delete selected rows"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search employee, clinic, illness..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>

          <button
            onClick={onOpenManualModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Row
          </button>
        </div>
      </div>

      {/* Main Table */}
      {filteredRecords.length === 0 ? (
        <div className="py-16 px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Receipt className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">
            {searchTerm ? 'No matching claims found' : 'No medical claims added yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchTerm
              ? `No records match "${searchTerm}". Try resetting your search filter.`
              : 'Upload receipt images above, test with a sample bill, or add entries manually to get started.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Clear Search Filter
              </button>
            ) : (
              <button
                onClick={onOpenManualModal}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                + Add Record Manually
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredRecords.length > 0 &&
                      filteredRecords.every((r) => selectedIds.has(r.id))
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3 w-12 text-center">Receipt</th>
                <th
                  onClick={() => toggleSort('employeeName')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none min-w-[160px]"
                >
                  <div className="flex items-center gap-1">
                    <span>1. Name of Employee</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('clinicName')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none min-w-[180px]"
                >
                  <div className="flex items-center gap-1">
                    <span>2. Clinic Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('date')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none min-w-[110px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Date & Inv #</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('subTotal')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 select-none min-w-[110px]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>3. Sub-Total</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('gst')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 select-none min-w-[90px]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>4. GST</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('grandTotal')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 select-none min-w-[120px]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>5. Grand Total</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 min-w-[220px]">
                  <span>6. Summary of Illness</span>
                </th>
                <th className="py-3 px-3 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRecords.map((record, index) => {
                const isSelected = selectedIds.has(record.id);
                const currency = record.currency || '$';

                return (
                  <tr
                    key={record.id}
                    className={`transition-colors hover:bg-slate-50/80 group ${
                      isSelected ? 'bg-emerald-50/30' : index % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(record.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                      />
                    </td>

                    {/* Receipt Thumbnail */}
                    <td className="py-2.5 px-3 text-center">
                      {record.receiptImage ? (
                        <button
                          type="button"
                          onClick={() => onViewReceipt(record)}
                          className="relative w-9 h-10 rounded-md overflow-hidden border border-slate-200 bg-slate-100 group/thumb mx-auto hover:border-emerald-500 transition-all cursor-pointer shadow-2xs block"
                          title="Click to inspect receipt image"
                        >
                          <img
                            src={record.receiptImage}
                            alt="Receipt"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      ) : (
                        <div
                          className="w-9 h-10 rounded-md border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-300 mx-auto"
                          title="No receipt image attached"
                        >
                          <Receipt className="w-4 h-4" />
                        </div>
                      )}
                    </td>

                    {/* 1. Name of Employee */}
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {record.employeeName.charAt(0).toUpperCase() || 'E'}
                        </div>
                        <span className="truncate max-w-[150px]" title={record.employeeName}>
                          {record.employeeName}
                        </span>
                      </div>
                    </td>

                    {/* 2. Clinic Name */}
                    <td className="py-3 px-3 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-medium max-w-[180px]" title={record.clinicName}>
                          {record.clinicName}
                        </span>
                      </div>
                    </td>

                    {/* Date & Invoice # */}
                    <td className="py-3 px-3 text-slate-500">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">{record.date || '—'}</span>
                        {record.invoiceNumber && (
                          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]">
                            #{record.invoiceNumber}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. Sub-Total */}
                    <td className="py-3 px-3 text-right font-medium text-slate-700 font-mono">
                      <span>{currency}</span>
                      <span>
                        {(Number(record.subTotal) || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    {/* 4. GST */}
                    <td className="py-3 px-3 text-right text-slate-600 font-mono">
                      <span>{currency}</span>
                      <span>
                        {(Number(record.gst) || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    {/* 5. Grand Total */}
                    <td className="py-3 px-3 text-right font-bold text-emerald-700 font-mono">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                        {currency}
                        {(Number(record.grandTotal) || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    {/* 6. Summary of Illness */}
                    <td className="py-3 px-3 text-slate-700">
                      <div className="flex items-start gap-1.5 max-w-[260px]">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span
                          className="line-clamp-2 text-xs leading-relaxed text-slate-800"
                          title={record.summaryOfIllness}
                        >
                          {record.summaryOfIllness || 'General Consultation'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-90 group-hover:opacity-100">
                        {record.receiptImage && (
                          <button
                            type="button"
                            onClick={() => onViewReceipt(record)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Verify Receipt & Fields"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEditRecord(record)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateRecord(record)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                          title="Duplicate Record"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRecord(record.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Grand Totals Footer */}
            <tfoot>
              <tr className="bg-slate-100/90 border-t-2 border-slate-300 font-bold text-slate-900 text-xs">
                <td colSpan={5} className="py-3 px-4 text-right uppercase tracking-wider text-slate-600">
                  Total Summary ({filteredRecords.length} records):
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-800">
                  ${totalSub.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-mono text-amber-800">
                  ${totalGst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-800">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-950 font-black">
                    ${totalGrand.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </td>
                <td colSpan={2} className="py-3 px-3 text-slate-500 font-normal text-[11px]">
                  Ready for Excel export (.xlsx)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

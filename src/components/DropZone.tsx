import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileImage,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  FlaskConical,
  X,
  FileText
} from 'lucide-react';
import { SAMPLE_RECEIPTS, generateSampleReceiptImage } from '../utils/sampleReceipts';

export interface FileProcessingItem {
  id: string;
  name: string;
  size: number;
  previewUrl: string;
  base64Data: string;
  mimeType: string;
  status: 'queued' | 'processing' | 'success' | 'error';
  progressMsg?: string;
  errorMsg?: string;
}

interface DropZoneProps {
  onProcessFiles: (files: { base64: string; mimeType: string; filename: string }[]) => Promise<void>;
  isProcessing: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onProcessFiles, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<FileProcessingItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global paste handler for images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const imageFiles = Array.from(e.clipboardData.files).filter((f) =>
          f.type.startsWith('image/')
        );
        if (imageFiles.length > 0) {
          handleFiles(imageFiles);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFiles = async (files: File[]) => {
    const validImageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (validImageFiles.length === 0) return;

    const newItems: FileProcessingItem[] = [];

    for (const file of validImageFiles) {
      const id = Math.random().toString(36).substring(2, 9);
      const previewUrl = URL.createObjectURL(file);

      // Read file as base64
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });

      newItems.push({
        id,
        name: file.name,
        size: file.size,
        previewUrl,
        base64Data,
        mimeType: file.type,
        status: 'queued',
        progressMsg: 'Queued for OCR...',
      });
    }

    setQueue((prev) => [...prev, ...newItems]);

    // Send to OCR processor
    try {
      await onProcessFiles(
        newItems.map((item) => ({
          base64: item.base64Data,
          mimeType: item.mimeType,
          filename: item.name,
        }))
      );
      // Mark queued items as done
      setQueue((prev) =>
        prev.map((it) =>
          newItems.some((n) => n.id === it.id)
            ? { ...it, status: 'success', progressMsg: 'Extracted successfully' }
            : it
        )
      );
      // Auto-clear success items after 4 seconds
      setTimeout(() => {
        setQueue((prev) => prev.filter((it) => it.status !== 'success'));
      }, 4000);
    } catch (err: any) {
      setQueue((prev) =>
        prev.map((it) =>
          newItems.some((n) => n.id === it.id)
            ? { ...it, status: 'error', errorMsg: err.message || 'Extraction failed' }
            : it
        )
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSampleClick = async (sampleId: string) => {
    const sample = SAMPLE_RECEIPTS.find((s) => s.id === sampleId);
    if (!sample) return;

    const base64Data = generateSampleReceiptImage(sampleId);
    if (!base64Data) return;

    const id = Math.random().toString(36).substring(2, 9);
    const item: FileProcessingItem = {
      id,
      name: `${sample.name.replace(/\s+/g, '_')}_Bill.png`,
      size: 145000,
      previewUrl: base64Data,
      base64Data,
      mimeType: 'image/png',
      status: 'processing',
      progressMsg: 'Running AI OCR extraction...',
    };

    setQueue((prev) => [...prev, item]);

    try {
      await onProcessFiles([
        {
          base64: base64Data,
          mimeType: 'image/png',
          filename: item.name,
        },
      ]);

      setQueue((prev) =>
        prev.map((it) =>
          it.id === id
            ? { ...it, status: 'success', progressMsg: 'Extracted successfully' }
            : it
        )
      );
      setTimeout(() => {
        setQueue((prev) => prev.filter((it) => it.id !== id));
      }, 4000);
    } catch (err: any) {
      setQueue((prev) =>
        prev.map((it) =>
          it.id === id
            ? { ...it, status: 'error', errorMsg: err.message || 'Extraction failed' }
            : it
        )
      );
    }
  };

  const removeQueueItem = (id: string) => {
    setQueue((prev) => prev.filter((it) => it.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs mb-6">
      {/* Top Banner / Explainer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-600" />
            Upload Medical Bills & Receipts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-extracts Employee Name, Clinic, Sub-Total, GST, Grand Total, and Summary of Illness
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            PNG, JPG, WEBP • Multi-file • Clipboard paste
          </span>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all cursor-pointer group ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/60 scale-[1.005]'
            : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/80 bg-slate-50/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/jpg"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(Array.from(e.target.files));
              e.target.value = '';
            }
          }}
        />

        <div className="flex flex-col items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-108 group-hover:border-emerald-300 transition-transform mb-3">
            <UploadCloud className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-slate-800">
            Drag & drop medical receipt images here, or{' '}
            <span className="text-emerald-600 underline decoration-emerald-300 underline-offset-2">
              browse files
            </span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            You can also paste directly from clipboard with <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-200 rounded text-slate-700">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-200 rounded text-slate-700">V</kbd>
          </p>

          <div className="flex items-center gap-3 mt-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <FileImage className="w-3.5 h-3.5 text-slate-400" />
              Batch uploads supported
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              AI OCR with Gemini 3.8 Flash
            </span>
          </div>
        </div>
      </div>

      {/* One-Click Sample Medical Receipts Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <FlaskConical className="w-4 h-4 text-indigo-600" />
            <span>Don't have a receipt image? Try a realistic sample:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {SAMPLE_RECEIPTS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSampleClick(sample.id)}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 border border-indigo-200/80 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>{sample.name}</span>
                <span className="text-[10px] bg-indigo-200/70 text-indigo-900 px-1 rounded font-bold">
                  {sample.total}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Processing Queue list */}
      {queue.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-xs font-semibold text-slate-600">
            Upload & Extraction Queue ({queue.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {queue.map((item) => (
              <div
                key={item.id}
                className={`relative flex items-center justify-between p-2.5 rounded-xl border text-xs overflow-hidden ${
                  item.status === 'processing' || isProcessing
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : item.status === 'success'
                    ? 'border-teal-200 bg-teal-50/60'
                    : item.status === 'error'
                    ? 'border-rose-200 bg-rose-50/60'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                {/* Visual Laser Scanner Line Effect when processing */}
                {(item.status === 'processing' || isProcessing) && (
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse" />
                )}

                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative">
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      {(item.status === 'processing' || isProcessing) && (
                        <>
                          <Loader2 className="w-3 h-3 text-emerald-600 animate-spin" />
                          <span className="text-emerald-700 font-medium">
                            Scanning & extracting fields...
                          </span>
                        </>
                      )}
                      {item.status === 'success' && (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                          <span className="text-teal-700 font-medium">Added to table</span>
                        </>
                      )}
                      {item.status === 'error' && (
                        <>
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span className="text-rose-700 font-medium">
                            {item.errorMsg || 'Failed'}
                          </span>
                        </>
                      )}
                      {item.status === 'queued' && (
                        <span>Queued ({(item.size / 1024).toFixed(0)} KB)</span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeQueueItem(item.id)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

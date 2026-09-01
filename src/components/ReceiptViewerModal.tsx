import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { X, Download, ZoomIn } from 'lucide-react';

export const ReceiptViewerModal: React.FC = () => {
  const { activeReceiptUrl, setActiveReceiptUrl } = useExpense();

  if (!activeReceiptUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in">
      <div className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-3xl bg-slate-900 border border-white/20 shadow-2xl p-4 flex flex-col items-center">
        
        {/* Actions Bar */}
        <div className="flex w-full items-center justify-between pb-3 border-b border-white/10 mb-3">
          <span className="text-xs font-bold text-white">Receipt Attachment Preview</span>
          <div className="flex items-center gap-2">
            <a
              href={activeReceiptUrl}
              download="Receipt_ExpensePK.png"
              className="rounded-xl bg-purple-600/30 border border-purple-500/40 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-600/50 flex items-center gap-1.5 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </a>
            <button
              onClick={() => setActiveReceiptUrl(null)}
              className="rounded-xl bg-white/10 p-1.5 text-slate-300 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Image Preview */}
        <div className="overflow-auto max-h-[75vh] w-full flex items-center justify-center rounded-2xl bg-black/40 p-2">
          <img
            src={activeReceiptUrl}
            alt="Transaction Receipt"
            className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};

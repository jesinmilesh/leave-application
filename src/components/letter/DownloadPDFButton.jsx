import React from 'react';
import { Download, Printer } from 'lucide-react';

export default function DownloadPDFButton({ onPrint }) {
  const handleDownloadPDF = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <button
      onClick={handleDownloadPDF}
      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group cursor-pointer"
      title="Download official A4 letter PDF or print document"
    >
      <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <Download className="w-4 h-4 text-cyan-200 group-hover:animate-bounce" />
      <span>Download Official PDF Letter</span>
      <Printer className="w-3.5 h-3.5 opacity-70" />
    </button>
  );
}

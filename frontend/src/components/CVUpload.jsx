import React, { useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

export default function CVUpload({ file, setFile }) {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        alert("Lütfen yalnızca PDF formatında bir dosya yükleyin.");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-indigo-600" />
        1. CV Yükleyin
      </h2>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
        id="cv-upload-input"
      />

      {!file ? (
        <label
          htmlFor="cv-upload-input"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? "border-indigo-600 bg-indigo-50/50"
              : "border-slate-200 hover:border-indigo-500 bg-slate-50/50"
          }`}
        >
          <Upload className={`w-10 h-10 mb-3 transition-colors ${isDragActive ? 'text-indigo-600' : 'text-slate-400'}`} />
          <p className="text-sm font-semibold text-slate-700">
            Dosyayı sürükleyin veya seçin
          </p>
          <p className="text-xs text-slate-400 mt-1">Yalnızca PDF formatı desteklenir (Maks. 10MB)</p>
        </label>
      ) : (
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors shrink-0"
            title="Dosyayı Kaldır"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

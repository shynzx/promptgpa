"use client";

import { useState, DragEvent } from "react";

export default function FileDropzone({ onFileSelect }: { onFileSelect: (f: File) => void }) {
  const [drag, setDrag] = useState(false);

  const toggleDrag = (e: DragEvent, state: boolean) => {
    e.preventDefault();
    setDrag(state);
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer ${
        drag ? "border-[#826dd2] bg-[#826dd2]/10" : "border-[#d7d7d7] hover:border-[#826dd2] hover:bg-gray-50"
      }`}
      onDragOver={(e) => toggleDrag(e, true)}
      onDragLeave={(e) => toggleDrag(e, false)}
      onDrop={(e) => {
        toggleDrag(e, false);
        if (e.dataTransfer.files?.[0]) onFileSelect(e.dataTransfer.files[0]);
      }}
    >
      <input
        type="file"
        className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
      />
      
      <div className="flex flex-col items-center justify-center space-y-2 text-center pointer-events-none">
        {drag ? (
          <>
            <svg
              className="w-10 h-10 text-[#826dd2]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-[#826dd2] font-bold text-lg">Subir</p>
          </>
        ) : (
          <>
            <svg 
              className="w-8 h-8 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-gray-500 font-medium">Arrastra un archivo aquí o haz clic para seleccionar</p>
            <p className="text-gray-400 text-xs">(Se guardará automáticamente)</p>
          </>
        )}
      </div>
    </div>
  );
}
import { FileText, Upload } from "lucide-react";


export interface DropzoneHandlers {
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
}

interface DropzoneProps {
  file: File | null;
  loading: boolean;
fileRef: React.RefObject<HTMLInputElement | null>;
  getDropzoneProps: () => DropzoneHandlers;
  handleFileChange: (f: File) => void;
}

export const Dropzone = ({ file, loading, fileRef, getDropzoneProps, handleFileChange }: DropzoneProps) => {
  return (
    <div
      {...getDropzoneProps()}
      className={`glass-card border-dashed flex flex-col items-center justify-center gap-3 py-10 transition-all duration-300 group ${
        loading
          ? "border-white/5 opacity-50 cursor-not-allowed"
          : "border-white/15 cursor-pointer hover:border-indigo-500/40 hover:bg-white/2"
      }`}
    >
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border-dashed border-indigo-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
        {file ? (
          <FileText size={22} className="text-emerald-400" />
        ) : (
          <Upload size={32} className="text-indigo-400" />
        )}
      </div>
      <div className="text-center">
        <p className="font-semibold text-white/80">
          {file ? file.name : "Drop your resume here"}
        </p>
        <p className="text-white/35 text-sm mt-0.5">
          or click to browse • PDF only • max 5MB
        </p>
      </div>
      <input
        type="file"
        ref={fileRef}
        accept=".pdf"
        disabled={loading}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFileChange(f);
          e.target.value = "";
        }}
      />
    </div>
  );
};
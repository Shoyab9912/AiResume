import { useState, useRef } from "react";

export function useToolForm() {
  const [mode, setMode] = useState<"manual" | "resume" | "improve">("manual");
  const [file, setFile] = useState<File | null>(null);

  const [error, setError] = useState("");
  
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(f: File) {
    if (f.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return false;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB.");
      return false;
    }
    setError("");
    setFile(f);
    return true;
  }

 
  const getDropzoneProps = (loading=false): {
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onClick: () => void;
  } => ({
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => {
      e.preventDefault();
      if (loading) return;
      const f = e.dataTransfer.files?.[0]; 
      if (f) handleFileChange(f);
    },
    onClick: () => {
      if (loading) return;
      fileRef.current?.click();
    },
  });

  return {
    mode,
    setMode,
    file,
    setFile,
    error,
    setError,
    fileRef,
    handleFileChange,
    getDropzoneProps,
  };
}
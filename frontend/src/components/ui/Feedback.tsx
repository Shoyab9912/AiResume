import { AlertCircle, Loader2 } from "lucide-react";

export const ErrorAlert = ({ message }: { message: string }) => {
  if (!message) return null;
  return (
    <p className="text-red-400 text-sm flex items-center gap-1.5 animate-fade-in">
      <AlertCircle size={14} /> {message}
    </p>
  );
};

export const LoadingState = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
      <Loader2 size={36} className="text-indigo-400 animate-spin" />
      <p className="text-white/40 text-sm">{message}</p>
    </div>
  );
};
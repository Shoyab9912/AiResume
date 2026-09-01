import { useId, type ComponentProps } from "react";

interface InputProps extends ComponentProps<"input"> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = "", ref, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const id = useId(); 

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className.includes('flex-1') ? 'flex-1' : ''}`}>
      {label && (
        <label htmlFor={id} className="text-xs text-white/30 uppercase tracking-widest">
          {label}
        </label>
      )}
      
      <input
        id={id}
        ref={ref}
        className={`w-full px-4 py-2.5 bg-white/5 border rounded-lg text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 ${
          error 
            ? "border-red-500/50 focus:ring-red-500/30" 
            : "border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20"
        } ${className}`}
        {...props}
      />
      
      {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
    </div>
  );
};
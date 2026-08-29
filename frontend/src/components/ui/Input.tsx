import { useId, type ComponentProps } from "react";

interface InputProps extends ComponentProps<"input"> {
  label: string;
  error?: string;
}

export const Input = ({ label, error, ref, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const id = useId(); 

  return (
    <div className="flex flex-col gap-1.5 w-full">
      { label && <label htmlFor={id} className="text-sm font-medium text-white/70">
        {label}
      </label> }
      
      <input
        id={id}
        ref={ref}
        className={`w-full px-4 py-2.5 bg-white/5 border rounded-lg text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 ${
          error 
            ? "border-red-500/50 focus:ring-red-500/30" 
            : "border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20"
        }`}
        {...props}
      />
      
      {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
    </div>
  );
};
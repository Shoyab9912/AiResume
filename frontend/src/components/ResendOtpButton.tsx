import { useState, useEffect } from "react";

interface ResendOtpButtonProps {
  onResend: () => Promise<void> | void;
  disabled?: boolean;
}

export const ResendOtpButton = ({ onResend, disabled }: ResendOtpButtonProps) => {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleClick = async () => {
    if (cooldown > 0) return;
    try {
      await onResend();
      setCooldown(60);
    } catch(error) {
       console.error("Failed to resend OTP:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={cooldown > 0 || disabled}
      className="text-sm text-indigo-400 hover:text-indigo-300 disabled:text-white/30 disabled:cursor-not-allowed"
    >
      {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
    </button>
  );
};
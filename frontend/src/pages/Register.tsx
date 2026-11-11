import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuthMutations } from "../hooks/useAuthMutations";
import { Input } from "../components/ui/Input";
import { ResendOtpButton } from "../components/ResendOtpButton";
import { features } from "../utils/features";
import { type ApiError } from "../types";
import { Hexagon } from "lucide-react";

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Invalid email address")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(10, "Password cannot exceed 10 characters"),
});
type RegisterFormValues = z.infer<typeof registerSchema>;

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "Enter the 6-digit code")
    .regex(/^\d+$/, "Digits only"),
});
type OtpFormValues = z.infer<typeof otpSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { registerMutation, googleMutation, verifyOtpMutation, resendOtpMutation } =
    useAuthMutations();

  const [step, setStep] = useState<"register" | "otp">("register");
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        setEmail(data.email);
        setStep("otp");
      },
      onError: (error: ApiError) => {
        const backendErrors = error.response?.data?.errors;
        if (backendErrors) {
          Object.entries(backendErrors).forEach(([field, messages]) => {
            setError(field as keyof RegisterFormValues, {
              type: "server",
              message: messages[0],
            });
          });
        }
      },
    });
  };

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    setError: setOtpFieldError,
    formState: { errors: otpErrors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  });

  const onVerifyOtp = (data: OtpFormValues) => {
    verifyOtpMutation.mutate(
      { email, otp: data.otp },
      {
        onSuccess: () => {
          navigate("/");
        },
        onError: (err: ApiError) => {
          setOtpFieldError("otp", {
            type: "server",
            message: err.response?.data?.message ?? "Invalid code",
          });
        },
      }
    );
  };

  const handleResendOtp = () => {
    return new Promise<void>((resolve, reject) => {
      resendOtpMutation.mutate(
        { email },
        {
          onSuccess: () => resolve(),
          onError: (err: ApiError) => reject(err),
        }
      );
    });
  };

  const isLoading = registerMutation.isPending;

  return (
    <div className="bg-page flex items-center justify-center p-4 min-h-screen">
      <div className="glass-card w-full max-w-md p-10 flex flex-col items-center gap-6 z-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#00e5ff]/10 border-2 border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff] shadow-lg shadow-[#00e5ff]/20">
            <Hexagon size={26} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gradient">
            Join Nova Forge
          </h1>
          <p className="text-white/60 text-sm leading-relaxed text-gradient">
            {step === "register"
              ? "Build, analyze, and land your next role."
              : "One more step to secure your account."}
          </p>
        </div>

        {step === "register" && (
          <>
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {features.map(({ icon: Icon, label }) => (
                <span key={label} className="feature-pill">
                  <Icon size={11} className="text-indigo-400" />
                  {label}
                </span>
              ))}
            </div>

            <div className="w-full mb-6 flex justify-center">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    googleMutation.mutate(credentialResponse.credential);
                  }
                }}
                onError={() => {
                  console.error("Google Login Failed");
                }}
                theme="filled_blue"
                text="continue_with"
              />
            </div>

            <div className="divider-subtle w-full flex items-center justify-center">
              <span className="text-white/60 text-xs px-2 bg-transparent">OR</span>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full flex flex-col gap-4"
            >
              <Input
                label="Full Name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                error={errors.name?.message}
                {...register("name")}
              />
              <Input
                label="Email Address"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 disabled:opacity-50"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="text-[11px] text-white/60 text-center leading-relaxed mt-2">
              By creating an account you agree to our{" "}
              <a href="#" className="underline underline-offset-2 hover:text-white/50 transition-colors">
                Terms
              </a>{" "}
              &{" "}
              <a href="#" className="underline underline-offset-2 hover:text-white/50 transition-colors">
                Privacy Policy
              </a>
            </div>

            <p className="text-sm text-white/50 mt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Log in
              </Link>
            </p>
          </>
        )}

        {step === "otp" && (
          <form
            onSubmit={handleOtpSubmit(onVerifyOtp)}
            className="w-full flex flex-col gap-4"
          >
            <p className="text-sm text-white/50 text-center">
              Enter the 6-digit code sent to <span className="text-white/70">{email}</span>
            </p>

            <Input
              label="OTP"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              error={otpErrors.otp?.message}
              {...registerOtp("otp", {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, "");
                },
              })}
            />

            <button
              type="submit"
              disabled={verifyOtpMutation.isPending}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
            </button>

            <ResendOtpButton onResend={handleResendOtp} />

            <button
              type="button"
              onClick={() => setStep("register")}
              className="text-xs text-white/60 hover:text-white/50"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
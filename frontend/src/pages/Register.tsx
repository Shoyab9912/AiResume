import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuthMutations } from "../hooks/useAuthMutations";
import { Input } from "../components/ui/Input";
import { features } from "../utils/features";
import {type ApiError} from "../types"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { registerMutation, googleMutation } = useAuthMutations();

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


  const isLoading = registerMutation.isPending

  return (
    <div className="bg-page flex items-center justify-center p-4 min-h-screen">
      <div className="orb w-96 h-96 bg-indigo-500 -top-20 -left-20" />
      <div className="orb w-80 h-80 bg-emerald-500 bottom-10 right-0" />
      <div className="orb w-64 h-64 bg-violet-600 top-1/2 left-1/2 -translate-x-1/2" />

      <div className="glass-card w-full max-w-md p-10 flex flex-col items-center gap-6 z-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-3xl">
            🚀
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gradient">
            Join CareerAI
          </h1>
          <p className="text-white/40 text-sm leading-relaxed text-gradient">
            Build, analyze, and land your next role.
          </p>
        </div>

        {/* Feature Pills */}
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
            useOneTap
          />
        </div>

        <div className="divider-subtle w-full flex items-center justify-center">
          <span className="text-white/30 text-xs px-2 bg-transparent">OR</span>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-4"
        >
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 disabled:opacity-50"
          >
            {registerMutation.isPending
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <div className="text-[11px] text-white/25 text-center leading-relaxed mt-2">
          By signing in you agree to our{" "}
          <a
            href="#"
            className="underline underline-offset-2 hover:text-white/50 transition-colors"
          >
            Terms
          </a>{" "}
          &{" "}
          <a
            href="#"
            className="underline underline-offset-2 hover:text-white/50 transition-colors"
          >
            Privacy Policy
          </a>
        </div>

        <p className="text-sm text-white/50 mt-2">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ApiError } from "../types";
import { useAuthMutations } from "../hooks/useAuthMutations";
import { Input } from "../components/ui/Input";
import { Hexagon } from "lucide-react";

const loginSchema = z.object({
  email: z.email( "Invalid email address" ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { loginMutation, googleMutation } = useAuthMutations();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onError: (error: ApiError) => {
        const backendErrors = error.response?.data?.errors;

        if (backendErrors) {
          Object.entries(backendErrors).forEach(([field, messages]) => {
            setError(field as keyof LoginFormValues, {
              type: "server",
              message: messages[0],
            });
          });
        }
      },
    });
  };

  
  const isLoading = loginMutation.isPending 

  return (
    <div className="bg-page flex items-center justify-center p-4 min-h-screen">
      {/* Background Orbs */}
      <div className="orb w-96 h-96 bg-indigo-500 -top-20 -left-20" />
      <div className="orb w-80 h-80 bg-emerald-500 bottom-10 right-0" />
      <div className="orb w-64 h-64 bg-violet-600 top-1/2 left-1/2 -translate-x-1/2" />

      
      <div className="glass-card w-full max-w-md p-10 flex flex-col items-center gap-8 z-10">
      
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#00e5ff]/10 border-2 border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff] shadow-lg shadow-[#00e5ff]/20">
            <Hexagon size={26} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gradient">
            NovaForge
          </h1>
          <p className="text-white/40 text-sm leading-relaxed text-gradient">
            Welcome back to your AI-powered career co-pilot.
          </p>
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
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 disabled:opacity-50"
          >
            {loginMutation.isPending ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-sm text-white/50">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

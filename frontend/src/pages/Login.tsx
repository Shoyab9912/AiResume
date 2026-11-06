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
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Invalid email address")),
  password: z.string().min(1, "Password is required"),
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
        const responseData = error.response?.data;

        if (responseData?.errors) {
          Object.entries(responseData.errors).forEach(([field, messages]) => {
            setError(field as keyof LoginFormValues, {
              type: "server",
              message: messages[0],
            });
          });
        } else {
          setError("root.server", {
            type: "server",
            message: responseData?.message ?? "Something went wrong. Please try again.",
          });
        }
      },
    });
  };

  const isLoading = loginMutation.isPending;

  return (
    <div className="bg-page flex items-center justify-center p-4 min-h-screen">
      <div className="glass-card w-full max-w-md p-10 flex flex-col items-center gap-8 z-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#00e5ff]/10 border-2 border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff] shadow-lg shadow-[#00e5ff]/20">
            <Hexagon size={26} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gradient">
            Nova Forge
          </h1>
          <p className="text-white/60 text-sm leading-relaxed text-gradient">
            Welcome back to your AI-powered Nova Forge co-pilot.
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
          <span className="text-white/60 text-xs px-2 bg-transparent">OR</span>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-4"
        >
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
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          {errors.root?.server?.message && (
            <p role="alert" className="text-sm text-red-400 text-center">
              {errors.root.server.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Log In"}
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
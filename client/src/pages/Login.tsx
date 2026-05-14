import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { login } from "../services/auth";
import { useAuth } from "../auth/AuthContext";
import Logo from "../components/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Please enter your email");
    if (!password) return setError("Please enter your password");
    setSubmitting(true);
    try {
      const { user } = await login({ email, password });
      setUser(user);
      navigate("/dashboard");
    } catch (err: any) {
      const msg =
        err?.response?.data?.issues?.[0]?.message ||
        err?.response?.data?.message ||
        "Login failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex bg-white dark:bg-gray-950">
      <div className="flex-[2] flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-6 left-6">
          <Logo />
        </div>
        <div className="w-full max-w-xs">
          <h1 className="text-2xl xl:text-3xl font-bold text-left dark:text-gray-100">Welcome Back!</h1>
          <p className="text-s xl:text-m mb-8 text-left dark:text-gray-400">Start Spending Wisely</p>
          <form onSubmit={handleSubmit} className="w-full" noValidate>
            <input
              className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 dark:bg-gray-800 dark:text-gray-100 border border-vivid-turquoise placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:outline-none focus:bg-white dark:focus:bg-gray-700"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative mt-5">
              <input
                className="w-full px-8 py-4 pr-12 rounded-lg font-medium bg-gray-100 dark:bg-gray-800 dark:text-gray-100 border border-vivid-turquoise placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:outline-none focus:bg-white dark:focus:bg-gray-700"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-loss-red text-sm mt-2 text-left">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="mt-5 tracking-wide font-semibold bg-vivid-turquoise text-white w-full py-4 rounded-lg hover:bg-turquoise transition-colors disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Login"}
            </button>
            <p className="w-full text-center mt-3 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-vivid-turquoise hover:underline">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
      <div className="flex-[3] hidden lg:flex">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url("/images/login-background-V2.webp")` }}
        />
      </div>
    </div>
  );
}

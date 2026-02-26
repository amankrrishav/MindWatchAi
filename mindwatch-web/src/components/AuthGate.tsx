import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { useAuth } from "../AuthContext";
import { login, register } from "../api/auth";

export default function AuthGate({ children }: { children: ReactElement }) {
  const { user, setUser } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fn = mode === "login" ? login : register;
      const res = await fn(email, password);
      window.localStorage.setItem("mw_access_token", res.access_token);
      setUser(res.user);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return children;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 font-sans">
      <div className="w-full max-w-md bg-pro-panel border border-pro-border rounded-xl shadow-panel p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2 flex items-center justify-center gap-2">
            <svg className="w-6 h-6 text-pro-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            MindWatch
          </h1>
          <p className="text-sm text-gray-400">
            {mode === "login" ? "Sign in to your account" : "Create your MindWatch account"}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              className="w-full bg-pro-bg border border-pro-border text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pro-accent focus:border-transparent transition-all placeholder-gray-600"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              className="w-full bg-pro-bg border border-pro-border text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pro-accent focus:border-transparent transition-all placeholder-gray-600"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-medium text-white bg-pro-accent rounded-lg hover:bg-pro-accentHover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex justify-center items-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
              </>
            ) : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            className="text-sm text-gray-400 hover:text-white transition-colors"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}


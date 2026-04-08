import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { motion } from "motion/react";
import { LogIn, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-xl"
      >
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">Admin Access</h1>
          <p className="mt-2 text-zinc-400">Sign in to manage your digital AR menu</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-800 border-t-black" />
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              Sign in with Google
            </>
          )}
        </button>

        <p className="text-center text-xs text-zinc-500">
          Authorized personnel only. All access attempts are logged.
        </p>
      </motion.div>
    </div>
  );
}

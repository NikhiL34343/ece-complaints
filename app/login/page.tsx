// pages/login/page.tsx  (or app/login/page.tsx depending on your structure)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { data, error: dbError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (dbError || !data) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    // Save only id + email in localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.id,
        email: data.email,
      })
    );

    // Admin check (id in env)
    const adminId = process.env.NEXT_PUBLIC_ADMIN_ID!;
    if (data.id === adminId) {
      router.push("/admin");
      return;
    }

    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-200 space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-indigo-700 mb-2">Complaint Portal</h1>
            <h2 className="text-xl font-semibold text-slate-700">Sign In to Your Account</h2>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-400 text-slate-800"
              placeholder="you@ece.iitr.ac.in" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-400 text-slate-800"
              placeholder="Enter your password" />
          </div>

          {error && <p className="bg-red-100 text-red-700 p-3 rounded-xl text-sm font-medium text-center">{error}</p>}

          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition">Secure Login</button>

          <p className="text-sm text-center text-slate-600 pt-2">
            New User? <a href="/email" className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline">Create Account</a>
          </p>
        </form>
      </div>
    </div>
  );
}


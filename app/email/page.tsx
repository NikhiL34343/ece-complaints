"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function EmailPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle"|"sending"|"success"|"error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith("@ece.iitr.ac.in")) {
      setStatus("error");
      setMessage("Only @ece.iitr.ac.in emails are allowed.");
      return;
    }
    setStatus("sending"); setMessage("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/new-user`,
        },
      });
      if (error) throw error;
      localStorage.setItem("allowNewUserAccess", "true");
      setStatus("success");
      setMessage("Magic link sent! Check your inbox.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Something went wrong.");
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Verify Your Email
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@ece.iitr.ac.in"
              // 👈 **STYLE CHANGE HERE: Added text-gray-900 for dark/black typed text.**
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" 
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {status === "sending" ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        {message && (
          <p
            className={`text-center mt-4 text-sm ${
              status === "error" ? "text-red-500" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
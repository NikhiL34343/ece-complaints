"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client"; // <-- IMPORTANT

const supabase = createClient();

export default function NewUserPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Block access unless user has token/session
  useEffect(() => {
    const checkAccess = async () => {
      const hash = window.location.hash;
      const hasToken =
        hash.includes("access_token") || hash.includes("refresh_token");

      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (!hasToken && !session) {
        router.replace("/login");
      }
    };
    checkAccess();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("saving");
    setMessage("");

    try {
      // Get user from Supabase magic link
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData?.user) {
        throw new Error("User not found. Please open the verification link again.");
      }

      const user = userData.user;

      // Insert into profiles table
      const { error: insertError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          email: user.email,
          password: password, // (weak storage as per your requirement)
        },
      ]);

      if (insertError) throw insertError;

      setStatus("success");
      setMessage("Account setup complete!");

      // Delay and redirect
      setTimeout(() => router.push("/login"), 1200);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Set Your Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a password"
              // 👈 STYLE CHANGE HERE
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              // 👈 STYLE CHANGE HERE
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold
            hover:bg-blue-700 transition disabled:opacity-50"
          >
            {status === "saving" ? "Saving..." : "Create Account"}
          </button>
        </form>

        {/* Status message */}
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
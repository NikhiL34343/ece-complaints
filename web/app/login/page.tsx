'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Query Supabase for matching user
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('full_name', fullName)
      .eq('password', password)
      .single();

    if (error || !data) {
      setError('Invalid full name or password. Please try again.');
      return;
    }

    // Save user in localStorage with email included
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: data.id,
        full_name: data.full_name,
        email: data.email,  // <-- ensure email is included
      })
    );

    // ✅ Admin check
    const adminId = process.env.NEXT_PUBLIC_ADMIN_ID!;
    if (data.id === adminId) {
      router.push('/admin');
      return; // stop further execution
    }

    // Redirect normal user to homepage
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200 space-y-6"
        >
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-indigo-700 mb-2">
                    Complaint Portal
                </h1>
                <h2 className="text-xl font-semibold text-slate-700">
                    Sign In to Your Account
                </h2>
            </div>
            
            {/* Input Group: Full Name */}
            <div>
                <label 
                    htmlFor="fullName" 
                    className="block text-sm font-medium text-slate-700 mb-1"
                >
                    Full Name
                </label>
                <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    // --- FIX APPLIED HERE: Added text-slate-800 for dark input text color ---
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm placeholder:text-gray-400 text-slate-800"
                    placeholder="e.g., Jane Doe"
                />
            </div>

            {/* Input Group: Password */}
            <div>
                <label 
                    htmlFor="password" 
                    className="block text-sm font-medium text-slate-700 mb-1"
                >
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    // --- FIX APPLIED HERE: Added text-slate-800 for dark input text color ---
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm placeholder:text-gray-400 text-slate-800"
                    placeholder="Enter your password"
                />
            </div>

            {/* Error Message */}
            {error && (
                <p className="bg-red-100 text-red-700 p-3 rounded-xl text-sm font-medium text-center">
                    {error}
                </p>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition duration-300 shadow-md shadow-indigo-300/50 transform hover:scale-[1.005]"
            >
                Secure Login
            </button>

            {/* Signup Link */}
            <p className="text-sm text-center text-slate-600 pt-2">
                New User?{' '}
                <a 
                    href="/email" 
                    className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition"
                >
                    Create Account
                </a>
            </p>
        </form>
      </div>
    </div>
  );
}
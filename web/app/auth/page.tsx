'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Restrict domain
    if (!email.endsWith('@ece.iitr.ac.in')) {
      setMessage('❌ Only @ece.iitr.ac.in emails allowed.')
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'http://localhost:3000/', // after verification
      },
    })

    if (error) setMessage('❌ Error sending email: ' + error.message)
    else setMessage('📧 Check your inbox for the login link!')
  }

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-semibold">ECE Complaints Login</h1>
        <input
          type="email"
          placeholder="yourname@ece.iitr.ac.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-lg p-2 w-64"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Send Login Link
        </button>
        <p className="text-center text-gray-600">{message}</p>
      </form>
    </main>
  )
}


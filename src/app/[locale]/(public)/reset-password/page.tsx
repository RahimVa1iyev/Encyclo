'use client'

import { getSession } from "next-auth/react";
import { useState } from 'react'
import { Link } from '@/lib/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleReset = async () => {
    if (password.length < 8) {
      setError('Şifrə ən azı 8 simvol olmalıdır')
      return
    }
    if (password !== confirmPassword) {
      setError('Şifrələr uyğun gəlmir')
      return
    }

    setLoading(true)
    setError('')

    
    // TODO: Implement NextAuth custom password update flow
      const updateError: any = null;
      // password: password,
    // })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}>
            ✓
          </div>
          <h1 className="text-2xl font-bold">Şifrəniz yeniləndi</h1>
          <p className="text-muted-foreground">Yeni şifrənizlə daxil ola bilərsiniz.</p>
          <Link
            href="/login"
            className="inline-block rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Daxil ol
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Yeni şifrə təyin edin</h1>
          <p className="text-muted-foreground text-sm">Yeni şifrənizi daxil edin</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Yeni şifrə</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ən azı 8 simvol"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Şifrəni təkrarla</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Şifrəni yenidən daxil edin"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleReset}
            disabled={loading || !password || !confirmPassword}
            className="w-full rounded-full py-3 text-sm font-semibold text-white disabled:opacity-50 transition-all"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {loading ? 'Yenilənir...' : 'Şifrəni yenilə'}
          </button>
        </div>
      </div>
    </div>
  )
}

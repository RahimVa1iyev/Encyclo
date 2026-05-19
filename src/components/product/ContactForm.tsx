'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, CheckCircle, Loader2 } from 'lucide-react'

interface ContactFormProps {
  productId: string
  companyId: string
  productName: string
}

export default function ContactForm({ productId, companyId, productName }: ContactFormProps) {
  const supabase = useMemo(() => createClient(), [])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Ad və email mütləqdir.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Düzgün email daxil edin.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error: insertError } = await supabase
        .from('leads')
        .insert({
          product_id: productId,
          company_id: companyId,
          name: name.trim(),
          email: email.trim(),
          message: message.trim() || null,
        })
      if (insertError) throw insertError
      setSuccess(true)
    } catch (err: unknown) {
      setError('Xəta baş verdi. Yenidən cəhd edin.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
        <CheckCircle className="w-10 h-10 text-green-500" />
        <p className="font-bold text-slate-900">Müraciətiniz göndərildi!</p>
        <p className="text-sm text-slate-500">Şirkət sizinlə əlaqə saxlayacaq.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        <span className="font-bold text-slate-600">{productName}</span> haqqında müraciət göndərin
      </p>
      <input
        type="text"
        placeholder="Adınız *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
      <input
        type="email"
        placeholder="Email *"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
      <textarea
        placeholder="Mesajınız (ixtiyari)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
      />
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Göndərilir...</>
          : <><Send className="w-4 h-4" /> Müraciət göndər</>
        }
      </button>
    </div>
  )
}

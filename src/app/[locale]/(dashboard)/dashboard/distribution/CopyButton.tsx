"use client"

import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Snippet kopyalandı!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button onClick={handleCopy} variant="outline" className="h-10">
      {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
      {copied ? "Kopyalandı!" : "Kodu kopyala"}
    </Button>
  )
}

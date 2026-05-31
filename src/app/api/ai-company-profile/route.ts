import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

interface CompanyProfileRequest {
  companyName: string
  categoryName: string
  answers: { question: string; answer: string }[]
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json(
      { error: 'Giriş tələb olunur' },
      { status: 401 }
    )
  }

  try {
    const { companyName, categoryName, answers } = await request.json() as CompanyProfileRequest

    if (!companyName) {
      return NextResponse.json({ error: 'Şirkət adı tələb olunur' }, { status: 400 })
    }
    if (!answers || answers.length === 0) {
      return NextResponse.json({ error: 'Cavablar tələb olunur' }, { status: 400 })
    }

    const answersText = answers
      .filter(a => a.answer.trim())
      .map(a => `Sual: ${a.question}\nCavab: ${a.answer}`)
      .join('\n\n')

    const systemPrompt = `Sən Azərbaycan bazarı üçün GEO (Generative Engine Optimization) ekspertisən.
Şirkət haqqında verilən məlumatlara əsasən 3 şey yarat:

1. DESCRIPTION — ChatGPT, Perplexity, Google AI-da tapılmaq üçün optimallaşdırılmış şirkət təsviri
2. META_TITLE — Google axtarışında görünəcək başlıq
3. META_DESCRIPTION — Google axtarışında görünəcək qısa təsvir

DESCRIPTION FORMATI — dəqiq bu strukturda yaz, boş sətir ilə blokları ayır:

[Şirkət adı] nədir?
[2-3 cümlə: şirkətin nə etdiyi, kimin üçün olduğu, nəyi fərqli etdiyi]

[Şirkət adı] kimə xidmət edir?
[2-3 cümlə: hədəf auditoriya, sənaye, şirkət ölçüsü]

[Şirkət adı]-nın üstünlükləri nələrdir?
[2-3 cümlə: rəqiblərdən fərqi, xüsusiyyətlər, faktlar]

[Şirkət adı] haqqında ətraflı məlumat
[2-3 cümlə: tarix, nailiyyətlər, əlaqə, CTA]

QAYDALAR:
- Şirkət adını hər blokda bir dəfə işlət (entity recognition)
- Yalnız verilən məlumatlardan istifadə et — heç nə uydurma
- Azərbaycan dilində, professional üslub
- Hər blok maksimum 60 söz
- Markdown işarəsi yoxdur (**, ##, tire yoxdur)

META_TITLE QAYDASI:
- Maksimum 60 simvol
- Format: "[Şirkət adı] — [əsas fəaliyyət] | [şəhər və ya ölkə]"

META_DESCRIPTION QAYDASI:
- Maksimum 155 simvol
- Tam cümlə ilə bitməlidir
- Şirkətin əsas dəyərini bir cümlədə ifadə et

ÇIXIŞ FORMATI — yalnız bu format, başqa heç nə yazma:
===DESCRIPTION===
[description mətni]
===META_TITLE===
[meta title]
===META_DESCRIPTION===
[meta description]`

    const userMessage = `Şirkət adı: ${companyName}
Kateqoriya: ${categoryName || 'göstərilməyib'}

Şirkət haqqında məlumatlar:
${answersText}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 1500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error?.message || 'Groq API xətası' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices[0].message.content as string

    const descriptionMatch = content.match(/===DESCRIPTION===\s*([\s\S]*?)(?====META_TITLE===|$)/)
    const metaTitleMatch = content.match(/===META_TITLE===\s*([\s\S]*?)(?====META_DESCRIPTION===|$)/)
    const metaDescriptionMatch = content.match(/===META_DESCRIPTION===\s*([\s\S]*?)$/)

    const description = descriptionMatch?.[1]?.trim() || ''
    const rawMetaTitle = metaTitleMatch?.[1]?.trim() || ''
    const rawMetaDescription = metaDescriptionMatch?.[1]?.trim() || ''

    const metaTitle = rawMetaTitle.slice(0, 60)
    const metaDescription = (() => {
      const raw = rawMetaDescription.slice(0, 155)
      if (raw.length < 155) return raw
      const lastDot = raw.lastIndexOf('.')
      return lastDot > 80 ? raw.slice(0, lastDot + 1) : raw
    })()

    if (!description) {
      return NextResponse.json(
        { error: 'Məzmun yaradıla bilmədi, yenidən cəhd edin' },
        { status: 500 }
      )
    }

    return NextResponse.json({ description, metaTitle, metaDescription })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Daxili server xətası'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

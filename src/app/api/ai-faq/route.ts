import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth'
import { RateLimiter } from '@/lib/rate-limit'

const rateLimiter = new RateLimiter(20, 60000)

interface AIFaqRequest {
  description: string;
  productName: string;
  topQuestions?: string;
  mainDifference?: string;
  supportInfo?: string;
  selectedIntents?: string[];
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  if (!rateLimiter.check(ip)) {
    return NextResponse.json({ error: 'Çox sayda sorğu göndərildi. Zəhmət olmasa biraz sonra yenidən cəhd edin.' }, { status: 429 })
  }

  const session = await auth()
  const user = session?.user

  if (!user) {
    return Response.json(
      { error: 'Giriş tələb olunur' },
      { status: 401 }
    )
  }

  try {
    const { 
      description, 
      productName,
      topQuestions,
      mainDifference,
      supportInfo,
      selectedIntents
    } = await request.json() as AIFaqRequest;

    if (!description) {
      return NextResponse.json({ error: 'Məhsul təsviri tələb olunur' }, { status: 400 });
    }

    if (!productName) {
      return NextResponse.json({ error: 'Məhsul adı tələb olunur' }, { status: 400 });
    }

    const cleanProductName = productName
      ? productName.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
      : 'Bu məhsul';

    const intents = selectedIntents && selectedIntents.length > 0 
      ? selectedIntents 
      : ['what_is', 'pricing', 'how_to', 'comparison', 'trust'];

    const intentCount = intents.length;

    const intentMap: Record<string, string> = {
      what_is:    'WHAT_IS intent: Məhsulun nə olduğunu və nə işə yaradığını soruşan sual',
      pricing:    'PRICING intent: Qiymət, tarif, ödəniş üsulları haqqında sual',
      how_to:     'HOW_TO intent: İstifadə qaydası, qeydiyyat, başlama prosesi haqqında sual',
      comparison: 'COMPARISON intent: Rəqiblərdən, alternativlərdən fərqini soruşan sual',
      trust:      'TRUST intent: Zəmanət, texniki dəstək, etibarlılıq haqqında sual',
    };

    const intentInstructions = intents
      .map((id, idx) => `${idx + 1}. ${intentMap[id] || id}`)
      .join('\n');

    const extraContext = [
      topQuestions?.trim() 
        ? `MÜŞTƏRİ SUALLAR (real müştərilərin tez-tez soruşduğu mövzular): ${topQuestions}` 
        : null,
      mainDifference?.trim() 
        ? `RƏQİBLƏRDƏN FƏRQ (şirkətin öz ifadəsi ilə): ${mainDifference}` 
        : null,
      supportInfo?.trim() 
        ? `DƏSTƏK VƏ ZƏMANƏT MƏLUMATI: ${supportInfo}` 
        : null,
    ].filter(Boolean).join('\n\n').trim();

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          max_tokens: Math.min(500 * intentCount, 3000),
          messages: [
            {
              role: "system",
              content: `Sen Azərbaycan bazarı üçün ixtisaslaşmış SEO/GEO ekspert copywriter-sən.
Sənin vəzifən: şirkətin verdiyi məlumatlara əsasən, ChatGPT və Perplexity kimi
AI axtarış sistemlərinin istifadəçilərə cavab verəcəyi FAQ-lar yaratmaqdır.

GEO prinsipləri:
- Hər sualda məhsul adı bir dəfə keçməlidir (entity recognition üçün)
- Cavablar birbaşa, faktlara əsaslı olmalıdır
- Azərbaycan vergi sistemi, Azərbaycan bazarı kontekstini nəzərə al

ÇIXIŞ FORMATI — yalnız bu format, başqa heç nə yazma:
${Array.from({length: intentCount}, (_, i) => 
  `QUESTION_${i+1}: sual\nANSWER_${i+1}: cavab`
).join('\n\n')}`
            },
            {
              role: "user",
              content: `Məhsul adı: ${cleanProductName}
Məhsul təsviri: ${description}
${extraContext ? '\nƏLAVƏ MƏLUMATLAR (bunları mütləq istifadə et):\n' + extraContext : ''}

Bu məhsul üçün DƏQIQ ${intentCount} FAQ yarat.
Hər sual fərqli intent kateqoriyasına aid olmalıdır:

${intentInstructions}

QAYDALAR — bunları pozma:
- Hər sualda "${cleanProductName}" adı bir dəfə keçməlidir
- Sual uzunluğu: 8-15 söz
- Cavab uzunluğu: 40-80 söz (nə az, nə çox)
- Cavab birbaşa başlamalıdır — "Bəli", "Xeyr", konkret fakt ilə
- Dil: saf Azərbaycan türkcəsi, rəsmi üslub
- Sual sonunda "?" işarəsi olmalıdır
- "Bizimlə əlaqə saxlayın" kimi boş CTA-lar yasaqdır
- ƏLAVƏ MƏLUMATLAR varsa, onları FAQ cavablarına inteqrasiya et`
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.error?.message || 'Groq API xətası' }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const faqs: { question: string; answer: string }[] = [];

    for (let i = 1; i <= intentCount; i++) {
      const fullText = i < intentCount ? content : content + '\n~~~END~~~';
      const nextMarker = i < intentCount ? `QUESTION_${i + 1}:` : '~~~END~~~';

      const questionMatch = fullText.match(
        new RegExp(`QUESTION_${i}:\\s*(.+?)(?=ANSWER_${i}:)`, 's')
      );
      const answerMatch = fullText.match(
        new RegExp(`ANSWER_${i}:\\s*(.+?)(?=${nextMarker})`, 's')
      );

      if (questionMatch && answerMatch) {
        const question = questionMatch[1].trim().replace(/\n+/g, ' ');
        const answer = answerMatch[1].trim().replace(/\n{3,}/g, '\n\n');

        if (question.length > 10 && answer.length > 20) {
          faqs.push({ question, answer });
        }
      }
    }

    if (faqs.length === 0) {
      return NextResponse.json(
        { error: 'FAQ generasiyası uğursuz oldu, yenidən cəhd edin' },
        { status: 500 }
      );
    }

    return NextResponse.json({ faqs });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Daxili server xətası';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

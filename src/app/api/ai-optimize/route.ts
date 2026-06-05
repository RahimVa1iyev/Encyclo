import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth'
import { RateLimiter } from '@/lib/rate-limit'

const rateLimiter = new RateLimiter(20, 60000)

interface OptimizeRequestBody {
  description: string;
  name: string;
  category?: string;
  price?: string;
  currency?: string;
  priceType?: string;
  tags?: string[];
  companyName?: string;
  targetLocales?: string[];
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  if (!rateLimiter.check(ip)) {
    return NextResponse.json({ error: 'Çoxlu sorğu göndərilib, bir az gözləyin' }, { status: 429 });
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
    const body: OptimizeRequestBody = await request.json();
    const {
      description,
      name = "",
      category = "",
      price = "",
      currency = "",
      priceType = "",
      tags = [],
      companyName = "",
      targetLocales = [],
    } = body;

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const needsTranslation = targetLocales.includes('en') || targetLocales.includes('ru');

    const systemPrompt = needsTranslation
      ? `You are a professional technical translator for Azerbaijani business content.

TASK: Translate the product name and description into the requested language(s).

TRANSLATION RULES:
- Translate EVERYTHING into the target language — including the product subtitle
- Keep ONLY the brand name untranslated (e.g. "Hesab Pro" stays as "Hesab Pro")
- But translate descriptive parts (e.g. "Onlayn Mühasibat Proqramı" → "Online Accounting Software")
- Preserve the question-answer text structure exactly
- The "description" value MUST be a single plain text string with \\n for line breaks
- Use natural, professional business language
- Do NOT add or remove any information — translate only

OUTPUT FORMAT — ONLY valid JSON, no markdown:
{
  "en": {
    "name": "Hesab Pro — Online Accounting Software",
    "description": "What is Hesab Pro — Online Accounting Software?\\nHesab Pro is an online accounting program...\\n\\nWhat problem does it solve?\\n...",
    "keywords": ["online accounting software Baku", "cheap accounting program Azerbaijan"]
  }
}

CRITICAL: "description" must be a FLAT STRING, never a nested object.`
      : `You are a GEO (Generative Engine Optimization) specialist for Azerbaijani business products.
You have two tasks:
TASK 1 — Category Analysis (internal, do not output this):
Analyze what users typically search for in the "${category || 'göstərilməyib'}" category in Azerbaijan.
Identify the top search intents, common terminology, and key pain points.
Use this analysis to inform Task 2.
TASK 2 — Rewrite the description:
Using the category analysis from Task 1 AND all the product context below,
rewrite the description so it gets selected as an answer by ChatGPT, Perplexity, and Google AI.
PRODUCT CONTEXT (use all of this):

Product name: ${name}
Category: ${category || 'göstərilməyib'}
Price: ${price || 'göstərilməyib'} ${currency || ''} (${priceType || 'göstərilməyib'})
Keywords/tags: ${Array.isArray(tags) ? tags.join(', ') : ''}
Company: ${companyName || 'göstərilməyib'}

MANDATORY OUTPUT STRUCTURE — use exactly this format, blank line between blocks:
${name} nədir?
[2-3 sentences: what it does, who it's for, what makes it different — use category terminology]

${name} hansı problemi həll edir?
[2-3 sentences: specific pain point common in this category + how this product solves it]

${name}-dan kim istifadə edir?
[2-3 sentences: target audience relevant to this category]

${name}-ın əsas üstünlükləri nələrdir?
[2-3 sentences: differentiators — include price ${price || ''} ${currency || ''} if available, include tags if relevant]

${name}-nın qiyməti nə qədərdir?
[1-2 sentences: pricing info — use the actual price and price type provided]

CRITICAL — FACTS PRESERVATION:
Before rewriting, extract every specific fact from the description:
- Named integrations (e.g. ASAN imza, ƏDV, e-qaimə)
- Trial periods, guarantees
- Website URLs, contact info
- Any specific numbers or features
Every extracted fact MUST appear in the rewritten output.
The 60-word limit per block is a guideline — never drop facts to meet it.

STRICT RULES:
- Use product name in EVERY question heading
- PRESERVE all numbers, prices, facts — never invent data
- Incorporate category-specific terminology naturally
- Each answer block: maximum 60 words
- No markdown (no **, ##, bullets, dashes)
- Output ONLY the structured text, nothing else
- Language: Azerbaijani`;

    const userMessage = needsTranslation
      ? `Məhsul adı: ${name}
Tərcümə ediləcək mətn (Azərbaycan dilindən):
${description}

Açar sözlər (Azərbaycan dilindən tərcümə et):
${Array.isArray(tags) && tags.length > 0 ? tags.join(', ') : 'yoxdur'}

Tələb olunan dillər: ${targetLocales.join(', ')}`
      : `Product name: ${name}
Category: ${category || 'göstərilməyib'}
Price: ${price || 'göstərilməyib'} ${currency || ''} — ${priceType || 'göstərilməyib'}
Keywords: ${Array.isArray(tags) ? tags.join(', ') : ''}
Company: ${companyName || 'göstərilməyib'}
Current description to optimize:
${description}`;

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
          max_tokens: needsTranslation ? 2000 : 1000,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userMessage
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.error?.message || 'Groq API error' }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    if (needsTranslation) {
      try {
        const cleanJson = content.replace(/```json|```/g, "").trim();
        const parsedData = JSON.parse(cleanJson);
        return NextResponse.json({ translations: parsedData });
      } catch (e) {
        console.error('Translation JSON parse error. Raw content:', content.slice(0, 500));
        return NextResponse.json({ error: 'Tərcümə nəticəsi oxuna bilmədi. Yenidən cəhd edin.' }, { status: 500 });
      }
    }

    return NextResponse.json({ optimizedText: content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

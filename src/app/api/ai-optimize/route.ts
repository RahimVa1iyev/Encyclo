import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server'
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

  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
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
      ? `You are a professional technical translator specializing in Azerbaijani business content.
You will receive a GEO-optimized Azerbaijani product description.

TASK: Translate it into the requested languages. Do NOT optimize or rewrite — translate only.

STRICT RULES:
- Preserve the question-answer structure exactly
- Keep the product name untranslated (do not translate proper nouns)
- Use professional business language in each target language
- Output ONLY valid JSON, no markdown, no explanation, no code fences
- Include only the requested language keys

OUTPUT FORMAT:
{
  "en": { "name": "...", "description": "..." },
  "ru": { "name": "...", "description": "..." }
}`
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
          max_tokens: 1000,
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
        return NextResponse.json({ error: 'Tərcümə nəticəsi oxuna bilmədi' }, { status: 500 });
      }
    }

    return NextResponse.json({ optimizedText: content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

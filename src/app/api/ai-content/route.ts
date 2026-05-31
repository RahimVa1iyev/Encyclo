import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server'

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
    const { mode, name, category: rawCategory, answers, description } = await request.json();
    const category = rawCategory || "Göstərilməyib";

    if (!mode) {
      return NextResponse.json({ error: 'Mode is required' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (mode === 'generate' && (!answers || answers.length === 0)) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
    }
    if (mode === 'keywords' && !description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    let systemPrompt = "";
    let userMessage = "";
    let maxTokens = 500;

    if (mode === 'keywords') {
      systemPrompt = `You are an Azerbaijani SEO and GEO keyword specialist.
You will receive a product name, category, and description.

TASK: Generate exactly 8 search keywords that real users type into Google or ChatGPT when looking for this type of product.

KEYWORD DISTRIBUTION — follow this mix:
- 2 keywords: product category + city (e.g. "Bakıda kuryer xidməti", "Bakı CRM proqramı")
- 2 keywords: problem-based (e.g. "sürətli çatdırılma Bakı", "ucuz mühasibat proqramı")  
- 2 keywords: price-based (e.g. "8 AZN kuryer", "aylıq 49 AZN CRM")
- 2 keywords: comparison or best-of (e.g. "ən yaxşı kuryer xidməti", "Azərbaycanda CRM müqayisə")

STRICT RULES:
- All keywords in Azerbaijani
- Each keyword: 2-4 words, no more
- Keywords must match the actual product — derive them from the description, not from generic patterns
- No duplicate intent — each keyword must target a different search moment
- Output ONLY valid JSON, no markdown, no explanation:
{"keywords":["...","...","...","...","...","...","...","..."]}`;
      userMessage = `Məhsul adı: ${name}\nKateqoriya: ${category}\n\nMəhsul təsviri:\n${description}`;
      maxTokens = 400;
    } else if (mode === 'questions') {
      systemPrompt = `You are an Azerbaijani business analyst who deeply understands the local market.
You will receive a product name and category.

TASK: Generate exactly 5 questions to help a business owner describe their product for GEO (AI search optimization).

QUESTION ORDER — follow this exact sequence:
1. "[Product name] nədir?" — use this exact phrasing, do not vary it
2. "[Product name] hansı problemi həll edir?" — focus on customer pain
3. "[Product name]-dan kim istifadə edir?" — target audience
4. "[Product name]-ın əsas üstünlükləri nələrdir?" — differentiators
5. "[Product name]-nın qiyməti necə müəyyən edilir?" — pricing and access

PLACEHOLDER RULES:
- Each placeholder must be a realistic example answer specific to the given category
- Maximum 10 words per placeholder
- Write it as real data, not as a template (bad: "məhsulun təsviri", good: "Bakıda restoranlara günlük kuryer xidməti")
- No explanations in placeholders

Output ONLY valid JSON, no markdown, no code fences, no explanation:
{"questions":[{"text":"...","placeholder":"..."},{"text":"...","placeholder":"..."},{"text":"...","placeholder":"..."},{"text":"...","placeholder":"..."},{"text":"...","placeholder":"..."}]}`;
      userMessage = `Məhsul adı: ${name}\nKateqoriya: ${category}\n\nVACİB: Bütün 5 sualda məhsul adını dəqiq "${name}" kimi istifadə et — dəyişmə.`;
      maxTokens = 600;
    } else {
      const answersText = answers.map((a: { question: string, answer: string }, i: number) => {
        const cleanQuestion = a.question.replace(/^\[|\]$/g, "").trim()
        return `${cleanQuestion}\nCavab: ${a.answer}`
      }).join('\n\n')

      userMessage = `Məhsul adı: ${name}\nKateqoriya: ${category}\n\n${answersText}`
      maxTokens = 1500

      systemPrompt = `Sən Azərbaycan biznes məhsulları üçün GEO məzmun mütəxəssisisən.
Sənə məhsul haqqında sual-cavab cütləri veriləcək.

MÜTLƏQİ BU FORMATDA YAZ — başqa heç nə yazma, heç bir JSON, markdown, kod bloku, mötərizə yoxdur:

Sualın tam mətni
2-3 cümlə Azərbaycan dilində cavab. Bütün rəqəm və faktları saxla. 1 əlavə kontekst cümləsi əlavə et.

Növbəti sualın tam mətni
2-3 cümlə Azərbaycan dilində cavab. Bütün rəqəm və faktları saxla. 1 əlavə kontekst cümləsi əlavə et.

Qalan 3 sual üçün eyni format — cəmi 5 blok, hər blok arasında tək boş sətir.

ƏLAVƏ QAYDA: Sual mətni yazarkən heç bir mötərizə [ ] işlətmə — sualı düz yaz.

===META===
metaTitle:[məhsul adı] — [əsas xüsusiyyət], [şəhər və ya brend] (maksimum 60 simvol, iki nöqtədən sonra birbaşa yaz)
metaDescription:[nə edir — 1 cümlə]. [əsas üstünlük]. [qiymət və ya CTA]. (maksimum 140 simvol, MÜTLƏQİ tam cümlə ilə bitir, heç vaxt cümləni yarımçıq buraxma, iki nöqtədən sonra birbaşa yaz)

QAYDALAR:
- Bütün mətn Azərbaycan dilində olsun — heç bir ingilis cümləsi yazma
- Sual mətni dəqiq verildiyi kimi yaz — dəyişmə, nömrə əlavə etmə
- Suallar arasında tək boş sətir qoy
- ===META=== sətrindən əvvəl və sonra boş sətir qoy
- metaTitle və metaDescription sətirlərində iki nöqtədən (:) sonra birbaşa mətn yaz, boşluq buraxma`
    }

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
          max_tokens: maxTokens,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
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

    if (mode === 'questions') {
      try {
        const cleanJson = content.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        return NextResponse.json({ questions: parsed.questions });
      } catch {
        return NextResponse.json({ error: 'Suallar oxuna bilmədi' }, { status: 500 });
      }
    }

    if (mode === 'keywords') {
      try {
        const cleanJson = content.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        return NextResponse.json({ keywords: parsed.keywords || [] });
      } catch {
        return NextResponse.json({ error: 'Açar sözlər oxuna bilmədi' }, { status: 500 });
      }
    }

    // Extract meta fields from anywhere in the content
    const metaTitleMatch = content.match(/^metaTitle:(.+)$/m);
    const metaDescriptionMatch = content.match(/^metaDescription:(.+)$/m);

    const metaTitle = metaTitleMatch ? metaTitleMatch[1].trim().slice(0, 60) : "";
    const metaDescription = metaDescriptionMatch ? (() => {
      const raw = metaDescriptionMatch[1].trim().slice(0, 155);
      if (raw.length < 155) return raw;
      const lastDot = raw.lastIndexOf('.');
      return lastDot > 80 ? raw.slice(0, lastDot + 1) : raw;
    })() : "";

    // Remove ===META=== block and everything after metaDescription line from description
    let descriptionPart = content;

    // Remove the ===META=== separator and everything from it to end
    const metaSeparatorIndex = content.indexOf("===META===");
    if (metaSeparatorIndex !== -1) {
      descriptionPart = content.slice(0, metaSeparatorIndex);
    }

    // Remove stray meta lines and normalize excessive blank lines to single blank line
    descriptionPart = descriptionPart
      .replace(/^metaTitle:.+$/gm, "")
      .replace(/^metaDescription:.+$/gm, "")
      .replace(/^===META===$\n?/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // If description is still empty, extract it from AFTER the ===META=== block
    if (!descriptionPart && metaSeparatorIndex !== -1) {
      const afterMeta = content.slice(metaSeparatorIndex + "===META===".length);
      descriptionPart = afterMeta
        .replace(/^metaTitle:.+$/gm, "")
        .replace(/^metaDescription:.+$/gm, "")
        .trim();
    }

    return NextResponse.json({
      description: descriptionPart,
      metaTitle,
      metaDescription
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

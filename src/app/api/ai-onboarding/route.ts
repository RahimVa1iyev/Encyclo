import { NextRequest, NextResponse } from "next/server";

interface AIOnboardingRequest {
  companyName: string;
  categoryName: string;
}

export async function POST(request: NextRequest) {
  try {
    const { companyName, categoryName } = (await request.json()) as AIOnboardingRequest;

    if (!companyName) {
      return NextResponse.json(
        { error: "Şirkət adı tələb olunur" },
        { status: 400 }
      );
    }

    if (!categoryName) {
      return NextResponse.json(
        { error: "Kateqoriya tələb olunur" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          max_tokens: 1000,
          messages: [
            {
              role: "system",
              content: `Sən Azərbaycan bazarı üzrə ixtisaslaşmış B2B SaaS üzrə GEO (Generative Engine Optimization) və SEO ekspertisən.
Sənin vəzifən: verilən şirkət adı və fəaliyyət sahəsi (kateqoriya) əsasında, ChatGPT, Perplexity, Google AI Overview kimi süni intellekt axtarış sistemlərində tapıla bilən, yüksək səviyyəli və GEO-optimallaşdırılmış professional şirkət təsviri (description) hazırlamaqdır.

QAYDALAR:
1. Dil: Tamamilə Azərbaycan dilində, olduqca professional, ciddi və cəlbedici B2B biznes üslubunda olmalıdır.
2. Format: Sual-cavab şəklində deyil, birbaşa axıcı abzaslardan ibarət professional mətn olmalıdır.
3. Uzunluq: Dəqiq 150-200 söz aralığında olmalıdır.
4. Məzmun: Verilən şirkət adı və fəaliyyət kateqoriyasından çıxış edərək, bu sahədə etibarlı, müasir və keyfiyyətli xidmət göstərən bir şirkət portretini təsvir et. Hallüsinasiya etmə: olmayan konkret ünvanlar, telefon nömrələri və ya real olmayan spesifik rəqəmlər uydurma.
5. Entity optimization: Şirkətin adını və fəaliyyət sahəsini mətnin daxilində təbii şəkildə bir neçə dəfə vurğula ki, süni intellekt axtarış motorları entity-ni asanlıqla tanıya bilsin.`,
            },
            {
              role: "user",
              content: `Şirkət adı: "${companyName}"
Kateqoriya (fəaliyyət sahəsi): "${categoryName}"

Zəhmət olmasa yuxarıdakı qaydalara tam riayət edərək, bu şirkət üçün GEO-optimallaşdırılmış, 150-200 sözlük mükəmməl təsvir mətni yarat. Yalnız mətni qaytar, heç bir ön söz, giriş və ya "budur mətn" kimi ifadələr yazma.`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error?.message || "Groq API xətası" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const description = data.choices[0].message.content.trim();

    return NextResponse.json({ description });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Daxili server xətası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

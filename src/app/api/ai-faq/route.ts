import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { description, productName } = await request.json();

    if (!description) {
      return NextResponse.json({ error: 'Məhsul təsviri tələb olunur' }, { status: 400 });
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
          max_tokens: 2000,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: "Sen FAQ generasiya ekspertisən. Məhsul təsvirinə əsasən ChatGPT və Perplexity kimi AI axtarış sistemlərinin cavab verəcəyi suallar yarat. Yalnız JSON formatında cavab ver, heç bir izahat yazma."
            },
            {
              role: "user",
              content: `Bu məhsul üçün 5 FAQ yarat: ${productName}\n\nTəsvir: ${description}\n\nJSON formatı:\n{"faqs": [{"question": "sual?", "answer": "cavab."}]}`
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

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json({ faqs: parsed.faqs || [] });
    } catch (parseError) {
      console.error('JSON parse error:', content);
      return NextResponse.json({ error: 'AI tərəfindən qaytarılan JSON formatı yanlışdır' }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Daxili server xətası' }, { status: 500 });
  }
}

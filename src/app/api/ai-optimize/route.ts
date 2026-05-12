import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
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
          max_tokens: 1000,
          messages: [
            {
              role: "system",
              content: "Sen GEO (Generative Engine Optimization) ekspertisən. Azərbaycan şirkətlərinin məhsul təsvirlərini ChatGPT, Perplexity və Google AI-da daha yaxşı görünmək üçün optimallaşdırırsan.\nQaydalar:\n- Sual-cavab formatında struktur əlavə et\n- Konkret faktlar, rəqəmlər, xüsusiyyətlər vurgula\n- Natural Azərbaycan dili istifadə et\n- 150-300 söz arası olsun\n- Heç bir markdown işarəsi istifadə etmə\nYalnız optimallaşdırılmış mətni qaytar, heç bir izahat yazma."
            },
            {
              role: "user",
              content: `Bu məhsul təsvirini GEO üçün optimallaşdır: ${description}`
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
    const optimizedText = data.choices[0].message.content;

    return NextResponse.json({ optimizedText });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

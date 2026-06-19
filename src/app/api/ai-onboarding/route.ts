import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: "Bu funksiya artıq mövcud deyil. Zəhmət olmasa şirkətiniz haqqında məlumatı əl ilə yazın və ya Dashboard > AI Məzmun bölməsindən struktur sual-cavab əsasında yaratdırın."
    },
    { status: 410 }
  );
}

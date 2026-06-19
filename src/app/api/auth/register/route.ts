import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcryptjs from "bcryptjs";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password, companyName, companySlug } = await req.json();

    if (!email || !password || !companyName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user exists
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.profile.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive"
        }
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Create user in profiles table
    // NextAuth standard uses uuid, let's generate one or let prisma do it if it's default
    // We will generate a UUID manually since it's required by our schema
    const userId = randomUUID();

    const user = await prisma.profile.create({
      data: {
        id: userId,
        email: normalizedEmail,
        password: hashedPassword,
        name: companyName, // store company name as user name for simplicity
        role: "company",
      },
    });

    const company = await prisma.company.create({
      data: {
        slug: companySlug,
        owner_id: user.id,
        status: "draft",
      },
    });

    await prisma.companyTranslation.create({
      data: {
        company_id: company.id,
        locale: "az",
        name: companyName,
      },
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcryptjs from "bcryptjs";

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
    const existingUser = await prisma.profile.findUnique({
      where: { email },
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
    const crypto = require("crypto");
    const userId = crypto.randomUUID();

    const user = await prisma.profile.create({
      data: {
        id: userId,
        email,
        password: hashedPassword,
        name: companyName, // store company name as user name for simplicity
        role: "company",
      },
    });

    // We don't create company here anymore, the frontend will call the createCompanyAfterRegisterAction
    // However, wait, the action might expect the user to be logged in. 
    // Wait, the client-side sign up happens via fetch, then it needs to login to get session.
    // We should return success, and the frontend will do signIn('credentials').

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

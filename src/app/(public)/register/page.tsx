"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn, slugify } from "@/lib/utils";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user data returned");

      // 2. Create Company
      const companySlug = slugify(companyName);
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .insert({
          slug: companySlug,
          owner_id: authData.user.id,
          status: "draft",
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // 3. Create Company Translation (default locale 'az')
      const { error: translationError } = await supabase
        .from("company_translations")
        .insert({
          company_id: companyData.id,
          locale: "az",
          name: companyName,
        });

      if (translationError) throw translationError;

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-8 py-10 shadow-xl rounded-2xl border border-gray-100">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-center text-sm text-gray-500 mb-8">
              Start building your business encyclopedia
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>
            <div>
              <label htmlFor="companyName" className="block text-sm font-semibold leading-6 text-gray-900">
                Company Name
              </label>
              <div className="mt-2">
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="block w-full rounded-xl border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                  placeholder="Acme Inc."
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold leading-6 text-gray-900">
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold leading-6 text-gray-900">
                  Confirm
                </label>
                <div className="mt-2">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-xl border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "flex w-full justify-center rounded-xl bg-indigo-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-lg hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed",
                  isLoading && "animate-pulse"
                )}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

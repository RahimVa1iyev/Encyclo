"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, slugify } from "@/lib/utils";

function getPasswordStrength(pwd: string): 0 | 1 | 2 | 3 {
  if (!pwd) return 0;
  if (pwd.length < 8) return 1;
  const hasLetter = /[a-zA-Z]/.test(pwd);
  const hasDigit = /[0-9]/.test(pwd);
  if (hasLetter && hasDigit) return 3;
  return 2;
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const passwordStrength = getPasswordStrength(password);

  const strengthLabel =
    passwordStrength === 1
      ? "Zəif"
      : passwordStrength === 2
      ? "Orta"
      : passwordStrength === 3
      ? "Güclü"
      : "";

  const strengthColors = [
    passwordStrength >= 1 ? "bg-red-500" : "bg-gray-200",
    passwordStrength >= 2 ? (passwordStrength === 2 ? "bg-yellow-400" : "bg-green-500") : "bg-gray-200",
    passwordStrength >= 3 ? "bg-green-500" : "bg-gray-200",
  ];

  const strengthTextColor =
    passwordStrength === 1
      ? "text-red-500"
      : passwordStrength === 2
      ? "text-yellow-500"
      : passwordStrength === 3
      ? "text-green-600"
      : "";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validations
    if (password.length < 8) {
      setError("Şifrə minimum 8 simvol olmalıdır");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifrələr uyğun gəlmir");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { onboarding_completed: false },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("İstifadəçi məlumatları alınmadı");

      // 3. Slug — check for duplicates
      let companySlug = slugify(companyName);
      const { data: existingSlug } = await supabase
        .from("companies")
        .select("id")
        .eq("slug", companySlug)
        .maybeSingle();

      if (existingSlug) {
        companySlug = companySlug + "-" + Math.floor(1000 + Math.random() * 9000);
      }

      // 4. Create Company
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

      // 5. Create Company Translation (default locale 'az')
      const { error: translationError } = await supabase
        .from("company_translations")
        .insert({
          company_id: companyData.id,
          locale: "az",
          name: companyName,
        });

      if (translationError) throw translationError;

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Qeydiyyat zamanı xəta baş verdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-8 py-10 shadow-xl rounded-2xl border border-gray-100">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="text-left text-3xl font-bold tracking-tight text-gray-900 mb-2">
              Hesab yaradın
            </h2>
            <p className="text-left text-sm text-gray-500 mb-8">
              Şirkətinizi Encyclo-da yerləşdirin
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>
            {/* Company Name */}
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-semibold leading-6 text-gray-900 mb-2"
              >
                Şirkət adı
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="block w-full rounded-xl border-0 p-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                placeholder="Acme Inc."
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold leading-6 text-gray-900 mb-2"
              >
                Email ünvanı
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border-0 p-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                placeholder="name@company.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold leading-6 text-gray-900 mb-2"
              >
                Şifrə
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 p-2.5 pr-11 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 rounded-r-xl text-gray-400 hover:text-gray-600 ring-1 ring-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {strengthColors.map((color, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1.5 flex-1 rounded-full transition-all duration-300",
                          color
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn("text-xs mt-1 font-medium", strengthTextColor)}>
                    {strengthLabel}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold leading-6 text-gray-900 mb-2"
              >
                Şifrəni təsdiqlə
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 p-2.5 pr-11 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 rounded-r-xl text-gray-400 hover:text-gray-600 ring-1 ring-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
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
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Hesab yaradılır...
                  </span>
                ) : (
                  "Qeydiyyatdan keç"
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Hesabınız var?{" "}
            <Link
              href="/login"
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Daxil olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

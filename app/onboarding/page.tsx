"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publicApi } from "@/lib/api";
import { AxiosError } from "axios";
import Link from "next/link";
// import { apiClient } from '@/lib/api/client';

const STEPS = ["School Details", "Verify Email", "Payment", "Pending Approval"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [form, setForm] = useState({
    schoolName: "",
    slug: "",
    ownerFirstName: "",
    ownerLastName: "",
    ownerEmail: "",
    ownerPhone: "",
    address: "",
    state: "",
    studentCount: "101-500",
    plan: "basic",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from school name
  const handleSchoolNameChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50);

    setForm((f) => ({ ...f, schoolName: value, slug }));
    setSlugAvailable(null);
  };

  const checkSlug = async () => {
    if (!form.slug || form.slug.length < 3) return;
    setIsCheckingSlug(true);
    try {
      const res = await publicApi.post("/onboarding/check-slug", {
        slug: form.slug,
      });
      setSlugAvailable(res.data.isAvailable);
    } catch {
      setSlugAvailable(false);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await publicApi.post("/onboarding/register", form);
      setStep(1); // Move to verify email step
    } catch (err: unknown) {
      setError(
        (err as AxiosError<{ message: string }>)?.response?.data?.message ??
          "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const PLAN_DETAILS = {
    basic: { price: "₦15,000/mo", storage: "10GB", label: "Basic" },
    standard: { price: "₦35,000/mo", storage: "50GB", label: "Standard" },
    premium: { price: "₦75,000/mo", storage: "200GB", label: "Premium" },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <h1 className="text-2xl font-bold">Eduvia</h1>
            <span className="text-accent-gold text-2xl font-black">.</span>
          </div>
          <span className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/" className="text-blue-700 hover:underline">
              Find your school
            </Link>
          </span>
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                  i < step
                    ? "bg-blue-800 text-white"
                    : i === step
                      ? "bg-blue-800 text-white ring-4 ring-blue-200"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span
                className={`text-sm hidden sm:block ${
                  i === step ? "text-slate-900 font-medium" : "text-slate-500"
                }`}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 ${
                    i < step ? "bg-blue-800" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Registration form */}
        {step === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Register your school
            </h1>
            <p className="text-slate-500 mb-8">
              Get your school on Eduvia in minutes.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* School name + slug */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  School Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    School Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.schoolName}
                    onChange={(e) => handleSchoolNameChange(e.target.value)}
                    placeholder="e.g. Greenfield Academy"
                    required
                    className="w-full h-11 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    School URL <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="flex items-center px-4 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-slate-500 text-sm whitespace-nowrap">
                      eduvia.com/
                    </span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, slug: e.target.value }));
                        setSlugAvailable(null);
                      }}
                      onBlur={checkSlug}
                      placeholder="greenfield-academy"
                      required
                      className="flex-1 h-11 px-4 border border-slate-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
                    />
                  </div>
                  {isCheckingSlug && (
                    <p className="text-xs text-slate-500 mt-1">
                      Checking availability...
                    </p>
                  )}
                  {slugAvailable === true && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ This URL is available
                    </p>
                  )}
                  {slugAvailable === false && (
                    <p className="text-xs text-red-600 mt-1">
                      ✗ This URL is taken. Try another.
                    </p>
                  )}
                </div>
              </div>

              {/* Owner info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Your Information (School Owner/Principal)
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.ownerFirstName}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          ownerFirstName: e.target.value,
                        }))
                      }
                      required
                      className="w-full h-11 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.ownerLastName}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          ownerLastName: e.target.value,
                        }))
                      }
                      required
                      className="w-full h-11 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.ownerEmail}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ownerEmail: e.target.value }))
                    }
                    required
                    className="w-full h-11 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.ownerPhone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ownerPhone: e.target.value }))
                    }
                    placeholder="+2348012345678"
                    required
                    className="w-full h-11 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, address: e.target.value }))
                      }
                      required
                      className="w-full h-11 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, state: e.target.value }))
                      }
                      placeholder="Lagos"
                      required
                      className="w-full h-11 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
                    />
                  </div>
                </div>
              </div>

              {/* Plan selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Choose Your Plan
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(PLAN_DETAILS).map(([key, plan]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, plan: key }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        form.plan === key
                          ? "border-blue-800 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-semibold text-slate-900 text-sm">
                        {plan.label}
                      </div>
                      <div className="text-blue-800 font-bold mt-1">
                        {plan.price}
                      </div>
                      <div className="text-slate-500 text-xs mt-1">
                        {plan.storage} storage
                      </div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Approximate Student Count
                  </label>
                  <select
                    value={form.studentCount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, studentCount: e.target.value }))
                    }
                    className="w-full h-11 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    <option value="1-100">1 – 100 students</option>
                    <option value="101-500">101 – 500 students</option>
                    <option value="501-1000">501 – 1,000 students</option>
                    <option value="1000+">1,000+ students</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || slugAvailable === false}
                className="w-full h-12 bg-blue-800 hover:bg-blue-900 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Create School Account →"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 1: Check email */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Check your email
            </h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              We sent a verification link to <strong>{form.ownerEmail}</strong>.
              Click the link to continue your registration.
            </p>
            <p className="text-slate-400 text-sm mt-6">
              Did not receive it? Check your spam folder or{" "}
              <button className="text-blue-700 hover:underline">
                resend the email
              </button>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

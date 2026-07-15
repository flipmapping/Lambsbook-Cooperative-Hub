import { useState } from 'react';
import { Link } from "wouter";

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  programOfInterest: string;
}

const INITIAL_STATE: FormState = {
  fullName: '',
  email: '',
  phone: '',
  country: '',
  programOfInterest: '',
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function ProspectRegistration() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isValid =
    form.fullName.trim() !== "" &&
    isValidEmail(form.email) &&
    form.country.trim() !== "" &&
    form.programOfInterest !== "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValid) {
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/admissions/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName:          form.fullName,
          email:             form.email,
          phone:             form.phone,
          country:           form.country,
          programOfInterest: form.programOfInterest,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setSubmitError(
          (body as { error?: string }).error ??
            "Submission failed. Please try again."
        );
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Prospect Registration Received
            </h1>
            <p className="mt-4 text-muted-foreground">
              Thank you for registering your interest.
            </p>
            <p className="mt-2 text-muted-foreground">
              Your registration has been submitted and our admissions
              team will be in touch within 5–7 business days.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/growth"
                className="inline-block rounded-md border border-input bg-background px-6 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-accent transition-colors"
              >
                Back to Growth
              </Link>
              <a
                href="https://www.ctbctech.edu.tw/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-primary bg-primary/5 px-6 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-primary/10 transition-colors"
              >
                Explore CTBC University
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Prospect Registration
          </h1>
          <p className="mt-2 text-muted-foreground">
            Complete the form below to begin your admissions journey. Our team
            will be in touch within 5–7 business days.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 555 000 0000"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="country" className="text-sm font-medium text-foreground">
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              autoComplete="country-name"
              value={form.country}
              onChange={handleChange}
              placeholder="Your country of residence"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="programOfInterest" className="text-sm font-medium text-foreground">
              Program of Interest
            </label>
            <select
              id="programOfInterest"
              name="programOfInterest"
              value={form.programOfInterest}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="" disabled>Select a program</option>
              <option value="business-administration">Business Administration</option>
              <option value="finance">Finance</option>
              <option value="information-management">Information Management</option>
              <option value="other">Other</option>
            </select>
          </div>

          {submitError && (
            <p role="alert" className="text-sm text-destructive">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !isValid}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

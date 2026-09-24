"use client";

import { useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { COLLEGE_DOMAIN, signupSchema } from "@/lib/validation";

type Fields = "fullName" | "alias" | "collegeEmail";
type FieldErrors = Partial<Record<Fields, string[]>>;

const inputClass =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30";

export default function SignupForm() {
  const [values, setValues] = useState({ fullName: "", alias: "", collegeEmail: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [token, setToken] = useState("");
  const [widgetFailed, setWidgetFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const update = (key: Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setFieldErrors((f) => ({ ...f, [key]: undefined }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    if (!token) {
      setFormError(
        widgetFailed
          ? "The security check couldn't load. Refresh the page and try again."
          : "Please complete the verification check.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, turnstileToken: token }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDone(true);
        return;
      }
      setFormError(data.error ?? "Something went wrong. Please try again.");
      if (data.fieldErrors) setFieldErrors(data.fieldErrors);
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
    // Tokens are single-use, so get a fresh one after any failed attempt.
    setToken("");
    turnstileRef.current?.reset();
  }

  if (done) {
    return (
      <div className="py-6 text-center" role="status">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
          ✓
        </div>
        <h2 className="text-xl font-semibold">You&apos;re registered!</h2>
        <p className="mt-2 text-slate-600">
          Thanks, {values.fullName.trim().split(" ")[0]}. Your details have been recorded.
        </p>
      </div>
    );
  }

  const field = (key: Fields, label: string, props: React.InputHTMLAttributes<HTMLInputElement>, hint?: string) => {
    const err = fieldErrors[key]?.[0];
    return (
      <div>
        <label htmlFor={key} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
        <input
          id={key}
          name={key}
          value={values[key]}
          onChange={update(key)}
          aria-invalid={!!err}
          aria-describedby={err ? `${key}-error` : hint ? `${key}-hint` : undefined}
          className={`${inputClass} ${err ? "border-red-500" : "border-slate-300"}`}
          required
          {...props}
        />
        {err ? (
          <p id={`${key}-error`} className="mt-1 text-sm text-red-600">
            {err}
          </p>
        ) : hint ? (
          <p id={`${key}-hint`} className="mt-1 text-xs text-slate-500">
            {hint}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {field(
        "fullName",
        "Full name",
        { type: "text", autoComplete: "name", placeholder: "e.g. Priya Sharma" },
        "Exactly as used during your AWS Builder Center sign-up",
      )}
      {field(
        "alias",
        "Alias / username",
        { type: "text", autoComplete: "username", autoCapitalize: "none", spellCheck: false, placeholder: "e.g. priyasharma" },
        "The alias you created on the AWS Builder Center portal",
      )}
      {field(
        "collegeEmail",
        "College email ID",
        { type: "email", autoComplete: "email", inputMode: "email", autoCapitalize: "none", placeholder: `yourname@${COLLEGE_DOMAIN}` },
        `The @${COLLEGE_DOMAIN} email used during sign-up`,
      )}

      <div className="flex justify-center overflow-hidden">
        <Turnstile
          ref={turnstileRef}
          siteKey={(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "").trim()}
          onSuccess={(t) => {
            setToken(t);
            setWidgetFailed(false);
          }}
          onExpire={() => setToken("")}
          onError={(code) => {
            setToken("");
            setWidgetFailed(true);
            console.error("Turnstile error", code);
          }}
          options={{ theme: "light", size: "flexible" }}
        />
      </div>

      {formError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-brand px-4 py-3 font-semibold text-ink shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}

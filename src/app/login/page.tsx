"use client";

import { useActionState, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { sendMagicLink } from "@/app/actions/auth";
import { Suspense } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
const initialState = { error: null, sent: false };

function LoginForm() {
  const [state, formAction, pending] = useActionState(
    sendMagicLink,
    initialState,
  );
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<InstanceType<typeof HCaptcha> | null>(null);

  const paramError =
    errorParam === "unauthorized"
      ? "That email address is not authorised to access the manager dashboard."
      : errorParam === "link-expired"
        ? "Your magic link has expired or is invalid. Please request a new one."
        : errorParam === "link-invalid"
          ? "The login link was malformed. Please request a new one."
          : null;

  if (state.sent) {
    return (
      <div className="text-center space-y-3">
        <div className="text-5xl">✉️</div>
        <h2 className="text-xl font-bold text-gray-800">Check your email</h2>
        <p className="text-gray-500 text-sm">
          We sent a magic link to your inbox. Click it to sign in — it expires
          in 10 minutes.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Manager Login</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your email to receive a magic link.
        </p>
      </div>

      {(paramError ?? state.error) && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {paramError ?? state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-sm"
            placeholder="you@example.com"
          />
        </div>

        {/* hidden field carries the captcha token into the server action */}
        <input type="hidden" name="captchaToken" value={captchaToken} />

        {HCAPTCHA_SITE_KEY ? (
          <HCaptcha
            ref={captchaRef}
            sitekey={HCAPTCHA_SITE_KEY}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken("")}
            onError={() => setCaptchaToken("")}
          />
        ) : (
          <p className="text-xs text-gray-400">
            hCaptcha not configured (NEXT_PUBLIC_HCAPTCHA_SITE_KEY missing).
          </p>
        )}

        <button
          type="submit"
          disabled={pending || (!!HCAPTCHA_SITE_KEY && !captchaToken)}
          className="w-full rounded-lg bg-orange-600 px-4 py-2.5 font-semibold text-white shadow transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {pending ? "Sending…" : "Send Magic Link"}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <span className="text-3xl font-extrabold text-orange-500">
            Todd&apos;s
          </span>
          <span className="text-3xl font-extrabold text-gray-800">
            {" "}
            Grill &amp; Bait
          </span>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

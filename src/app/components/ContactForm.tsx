"use client";

import { useRef, useState, useTransition } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { submitContact } from "@/app/actions/contact";

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? "";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const captchaRef = useRef<InstanceType<typeof HCaptcha> | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!captchaToken) {
      setStatus("error");
      setErrorMsg("Please complete the captcha challenge.");
      return;
    }
    const formData = new FormData(e.currentTarget);
    formData.set("hcaptchaToken", captchaToken);
    startTransition(async () => {
      const result = await submitContact(formData);
      if (result.ok) {
        setStatus("success");
        formRef.current?.reset();
        setCaptchaToken("");
        captchaRef.current?.resetCaptcha();
      } else {
        setStatus("error");
        setErrorMsg(result.error ?? "Something went wrong. Please try again.");
        if (result.resetCaptcha) {
          setCaptchaToken("");
          captchaRef.current?.resetCaptcha();
        }
      }
    });
  }

  const inputClass =
    "mt-1 block w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 disabled:opacity-50 transition-colors";

  return (
    <section id="contact" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-orange-600">Contact Todd</h2>
            <p className="mt-2 text-gray-500 text-sm">
              Questions, reservations, or just want to talk fishing? Drop us a
              line.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {status === "success" ? (
              <div className="py-6 text-center">
                <p className="text-4xl mb-3">🎣</p>
                <p className="text-gray-900 font-semibold text-lg">
                  Message sent!
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Thanks for reaching out. Todd will get back to you soon.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-5 text-sm text-orange-600 underline underline-offset-2 hover:text-orange-800"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                {status === "error" && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-0.5"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    autoComplete="name"
                    className={inputClass}
                    required
                    disabled={pending}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-0.5"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    className={inputClass}
                    required
                    disabled={pending}
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-0.5"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className={inputClass + " resize-none"}
                    required
                    disabled={pending}
                  />
                </div>

                {HCAPTCHA_SITE_KEY && (
                  <HCaptcha
                    ref={captchaRef}
                    sitekey={HCAPTCHA_SITE_KEY}
                    onVerify={(token) => {
                      setCaptchaToken(token);
                      setStatus("idle");
                    }}
                    onExpire={() => setCaptchaToken("")}
                  />
                )}

                <button
                  type="submit"
                  disabled={pending || !captchaToken}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {pending ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

"use server";

import { Resend } from "resend";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z.email("A valid email address is required").max(150),
  ),
  message: z.string().trim().min(1, "Message is required").max(2000),
  hcaptchaToken: z.string().min(1, "Please complete the captcha challenge."),
});

type ContactResult = {
  ok: boolean;
  error?: string;
  resetCaptcha?: boolean;
};

async function verifyHCaptchaToken(token: string) {
  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) return { ok: false, error: "Captcha configuration is missing." };

  const res = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }).toString(),
  });

  const data = (await res.json()) as { success?: boolean };
  if (!data.success) {
    return {
      ok: false,
      error: "Captcha verification failed. Please try again.",
    };
  }
  return { ok: true };
}

export async function submitContact(
  formData: FormData,
): Promise<ContactResult> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    hcaptchaToken: formData.get("hcaptchaToken"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const { name, email, message, hcaptchaToken } = parsed.data;

  const captcha = await verifyHCaptchaToken(hcaptchaToken);
  if (!captcha.ok) {
    return { ok: false, error: captcha.error, resetCaptcha: true };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return { ok: false, error: "Email service is not configured." };
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "Todd's Grill Contact Form <contact@toddtech.llc>",
    to: "toddwyatt@outlook.com",
    replyTo: email,
    subject: `New message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  });

  if (error) {
    console.error("Resend error:", error);
    return {
      ok: false,
      error: "Failed to send your message. Please try again.",
    };
  }

  return { ok: true };
}
